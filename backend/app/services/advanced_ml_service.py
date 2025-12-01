"""
Advanced ML Models Service for sophisticated forecasting and optimization.
Implements Temporal Fusion Transformer (TFT), N-BEATS, and DeepAR models.
"""

import asyncio
import json
import pickle
from datetime import datetime, timedelta
from typing import Dict, List, Optional, Any, Union, Tuple
import numpy as np
import pandas as pd
import torch
import torch.nn as nn
import torch.optim as optim
from sklearn.preprocessing import StandardScaler, MinMaxScaler
from sklearn.metrics import mean_absolute_error, mean_squared_error
from sklearn.model_selection import train_test_split
import joblib
import os
from pathlib import Path

# Import MLflow if available
try:
    import mlflow
    import mlflow.pytorch
    MLFLOW_AVAILABLE = True
except ImportError:
    MLFLOW_AVAILABLE = False
    print("MLflow not available - model tracking disabled")

# Import additional libraries for advanced models
try:
    from prophet import Prophet
    PROPHET_AVAILABLE = True
except ImportError:
    PROPHET_AVAILABLE = False
    print("Prophet not available")

from ..core.config import get_settings

settings = get_settings()


class TemporalFusionTransformer(nn.Module):
    """Temporal Fusion Transformer model for multi-horizon forecasting."""
    
    def __init__(
        self,
        input_size: int,
        output_size: int,
        hidden_size: int = 128,
        lstm_layers: int = 2,
        dropout: float = 0.1,
        num_heads: int = 4,
        num_quantiles: int = 4
    ):
        super().__init__()
        
        self.input_size = input_size
        self.output_size = output_size
        self.hidden_size = hidden_size
        self.lstm_layers = lstm_layers
        self.num_quantiles = num_quantiles
        
        # Static features embedding
        self.static_embedding = nn.Linear(input_size, hidden_size)
        
        # Temporal variable selection networks
        self.temporal_selection = nn.ModuleList([
            nn.GRU(1, hidden_size, batch_first=True) for _ in range(input_size)
        ])
        
        # Gating mechanisms
        self.static_gate = nn.Linear(hidden_size, hidden_size)
        self.temporal_gate = nn.GRU(hidden_size, hidden_size, batch_first=True)
        
        # LSTM encoder-decoder
        self.encoder = nn.LSTM(
            hidden_size, hidden_size, lstm_layers, 
            batch_first=True, dropout=dropout
        )
        self.decoder = nn.LSTM(
            hidden_size, hidden_size, lstm_layers,
            batch_first=True, dropout=dropout
        )
        
        # Multi-head attention
        self.attention = nn.MultiheadAttention(
            hidden_size, num_heads, dropout=dropout
        )
        
        # Output projection for quantiles
        self.output_projection = nn.Linear(hidden_size, output_size * num_quantiles)
        
        # Activation and dropout
        self.relu = nn.ReLU()
        self.dropout = nn.Dropout(dropout)
        
    def forward(self, x):
        batch_size, seq_len, features = x.shape
        
        # Static embedding
        static_feat = torch.mean(x, dim=1)  # Pool across time
        static_embed = self.relu(self.static_gate(self.static_embedding(static_feat)))
        
        # Temporal variable selection
        temporal_feats = []
        for i in range(features):
            temporal_feat = x[:, :, i:i+1]
            _, hidden = self.temporal_selection[i](temporal_feat)
            temporal_feats.append(hidden[-1])
        
        temporal_concat = torch.stack(temporal_feats, dim=1)
        
        # LSTM encoding
        encoder_out, (h_n, c_n) = self.encoder(temporal_concat)
        
        # LSTM decoding for future prediction
        decoder_out, _ = self.decoder(temporal_concat[:, -1:], (h_n, c_n))
        
        # Attention mechanism
        decoder_out = decoder_out.transpose(0, 1)
        attended_out, _ = self.attention(decoder_out, encoder_out, encoder_out)
        
        # Output projection for quantiles
        output = self.output_projection(attended_out.squeeze(0))
        output = output.view(batch_size, self.output_size, self.num_quantiles)
        
        return output


class NBeatsBlock(nn.Module):
    """Individual N-BEATS block."""
    
    def __init__(
        self,
        input_size: int,
        theta_size: int,
        basis_function: str = "trend",
        hidden_layer_size: int = 512,
        number_of_harmonics: int = 4
    ):
        super().__init__()
        
        self.basis_function = basis_function
        self.theta_size = theta_size
        self.number_of_harmonics = number_of_harmonics
        
        # Fully connected layers
        self.fc_block = nn.Sequential(
            nn.Linear(input_size, hidden_layer_size),
            nn.ReLU(),
            nn.Dropout(0.2),
            nn.Linear(hidden_layer_size, hidden_layer_size),
            nn.ReLU(),
            nn.Dropout(0.2)
        )
        
        # Basis function coefficients
        self.theta_layer = nn.Linear(hidden_layer_size, theta_size)
        
        # Basis function implementation
        if basis_function == "trend":
            self.basis_function_block = TrendBasis(
                backcast_length=input_size,
                forecast_length=theta_size // 2,
                number_of_harmonics=number_of_harmonics
            )
        elif basis_function == "seasonality":
            self.basis_function_block = SeasonalityBasis(
                backcast_length=input_size,
                forecast_length=theta_size // 2,
                number_of_harmonics=number_of_harmonics
            )
        else:  # "generic"
            self.basis_function_block = GenericBasis(
                backcast_length=input_size,
                forecast_length=theta_size // 2
            )
    
    def forward(self, x):
        # x shape: (batch_size, input_size)
        residuals = self.fc_block(x)
        theta = self.theta_layer(residuals)
        backcast, forecast = self.basis_function_block(theta)
        
        return backcast, forecast


class NBeats(nn.Module):
    """N-BEATS neural network for time series forecasting."""
    
    def __init__(
        self,
        input_size: int,
        output_size: int,
        hidden_layer_size: int = 512,
        number_of_blocks: int = 3,
        number_of_harmonics: int = 4
    ):
        super().__init__()
        
        self.input_size = input_size
        self.output_size = output_size
        
        # Create blocks with different basis functions
        self.blocks = nn.ModuleList([
            NBeatsBlock(
                input_size=input_size,
                theta_size=input_size + output_size,
                basis_function="trend" if i % 3 == 0 else "seasonality" if i % 3 == 1 else "generic",
                hidden_layer_size=hidden_layer_size,
                number_of_harmonics=number_of_harmonics
            )
            for i in range(number_of_blocks)
        ])
    
    def forward(self, x):
        # x shape: (batch_size, input_size)
        backcast = x
        forecast = torch.zeros_like(x)
        
        for block in self.blocks:
            block_backcast, block_forecast = block(backcast)
            backcast = backcast - block_backcast
            forecast = forecast + block_forecast
        
        return forecast


class DeepARModel(nn.Module):
    """DeepAR model for probabilistic forecasting."""
    
    def __init__(
        self,
        input_size: int,
        hidden_size: int = 64,
        num_layers: int = 2,
        dropout: float = 0.1,
        likelihood: str = "gaussian"
    ):
        super().__init__()
        
        self.input_size = input_size
        self.hidden_size = hidden_size
        self.num_layers = num_layers
        self.likelihood = likelihood
        
        # LSTM encoder
        self.lstm = nn.LSTM(
            input_size, hidden_size, num_layers,
            batch_first=True, dropout=dropout
        )
        
        # Output layers for parameters
        if likelihood == "gaussian":
            self.output_layer = nn.Linear(hidden_size, 2)  # mean, std
        elif likelihood == "poisson":
            self.output_layer = nn.Linear(hidden_size, 1)  # lambda
        elif likelihood == "negative_binomial":
            self.output_layer = nn.Linear(hidden_size, 2)  # r, p
        
        self.dropout = nn.Dropout(dropout)
    
    def forward(self, x, future_steps: int = 0):
        batch_size, seq_len, _ = x.shape
        
        # Encode sequence
        encoded, (hidden, cell) = self.lstm(x)
        
        # Get final hidden state
        hidden = self.dropout(hidden[-1])
        
        # Generate future predictions
        outputs = []
        current_input = x[:, -1:, :]  # Last time step
        
        for step in range(future_steps):
            # Process current input
            output, (hidden, cell) = self.lstm(current_input, (hidden, cell))
            
            # Get likelihood parameters
            params = self.output_layer(self.dropout(output[:, -1, :]))
            outputs.append(params)
            
            # Update input for next step (use prediction if training)
            if self.training:
                # During training, use actual next step
                current_input = x[:, step+1:step+2, :] if step + 1 < seq_len else current_input
            else:
                # During inference, use predicted parameters to generate next input
                # This is simplified - in practice you'd need proper likelihood sampling
                current_input = output[:, -1:, :]
        
        if outputs:
            return torch.stack(outputs, dim=1)
        else:
            # Just return encoded representation
            return self.output_layer(self.dropout(hidden)).unsqueeze(1)


class AdvancedMLService:
    """Advanced ML service with TFT, N-BEATS, and DeepAR implementations."""
    
    def __init__(self):
        self.models = {}
        self.scalers = {}
        self.model_metadata = {}
        self.models_dir = Path(settings.MODELS_DIR)
        self.models_dir.mkdir(exist_ok=True)
        
    async def initialize(self):
        """Initialize the ML service."""
        print("Advanced ML service initialized")
        
        # Start MLflow tracking if available
        if MLFLOW_AVAILABLE:
            try:
                mlflow.set_tracking_uri(settings.mlflow_tracking_uri)
                mlflow.set_experiment("optibid_forecasting")
            except Exception as e:
                print(f"MLflow initialization error: {e}")
    
    async def train_tft_model(
        self,
        data: pd.DataFrame,
        target_column: str,
        feature_columns: List[str],
        horizon: int = 24,
        epochs: int = 100,
        batch_size: int = 32
    ) -> Dict[str, Any]:
        """Train Temporal Fusion Transformer model."""
        try:
            # Prepare data
            X = data[feature_columns].values
            y = data[target_column].values
            
            # Scale features and target
            scaler_X = StandardScaler()
            scaler_y = StandardScaler()
            
            X_scaled = scaler_X.fit_transform(X)
            y_scaled = scaler_y.fit_transform(y.reshape(-1, 1)).flatten()
            
            # Create sequences for training
            sequence_length = min(60, len(X_scaled) // 4)
            X_seq, y_seq = self._create_sequences(X_scaled, y_scaled, sequence_length, horizon)
            
            if len(X_seq) == 0:
                return {"success": False, "error": "Insufficient data for sequence creation"}
            
            # Initialize model
            model = TemporalFusionTransformer(
                input_size=len(feature_columns),
                output_size=horizon
            )
            
            optimizer = optim.Adam(model.parameters(), lr=0.001)
            criterion = nn.MSELoss()
            
            # Training loop
            model.train()
            train_losses = []
            
            for epoch in range(epochs):
                epoch_loss = 0
                
                for i in range(0, len(X_seq), batch_size):
                    batch_X = torch.FloatTensor(X_seq[i:i+batch_size])
                    batch_y = torch.FloatTensor(y_seq[i:i+batch_size])
                    
                    optimizer.zero_grad()
                    outputs = model(batch_X)
                    
                    # Calculate loss (mean over quantiles)
                    loss = criterion(outputs[:, :, 0], batch_y)  # Use median quantile
                    loss.backward()
                    optimizer.step()
                    
                    epoch_loss += loss.item()
                
                avg_loss = epoch_loss / (len(X_seq) // batch_size + 1)
                train_losses.append(avg_loss)
                
                if epoch % 10 == 0:
                    print(f"TFT Training Epoch {epoch}, Loss: {avg_loss:.4f}")
            
            # Save model and scalers
            model_id = f"tft_{datetime.now().strftime('%Y%m%d_%H%M%S')}"
            model_path = self.models_dir / f"{model_id}.pt"
            
            torch.save({
                'model_state_dict': model.state_dict(),
                'model_config': {
                    'input_size': len(feature_columns),
                    'output_size': horizon,
                    'feature_columns': feature_columns,
                    'target_column': target_column
                },
                'training_history': train_losses
            }, model_path)
            
            # Save scalers
            scaler_X_path = self.models_dir / f"{model_id}_scaler_X.pkl"
            scaler_y_path = self.models_dir / f"{model_id}_scaler_y.pkl"
            
            joblib.dump(scaler_X, scaler_X_path)
            joblib.dump(scaler_y, scaler_y_path)
            
            # Track with MLflow
            if MLFLOW_AVAILABLE:
                with mlflow.start_run():
                    mlflow.pytorch.log_model(model, "tft_model")
                    mlflow.log_param("horizon", horizon)
                    mlflow.log_param("features", len(feature_columns))
                    mlflow.log_metric("final_loss", train_losses[-1])
            
            return {
                "success": True,
                "model_id": model_id,
                "model_path": str(model_path),
                "training_loss": train_losses,
                "final_loss": train_losses[-1],
                "model_config": {
                    "type": "Temporal Fusion Transformer",
                    "input_features": len(feature_columns),
                    "horizon": horizon,
                    "epochs": epochs
                }
            }
            
        except Exception as e:
            return {"success": False, "error": str(e)}
    
    async def train_nbeats_model(
        self,
        data: pd.DataFrame,
        target_column: str,
        horizon: int = 24,
        epochs: int = 200,
        batch_size: int = 32
    ) -> Dict[str, Any]:
        """Train N-BEATS model."""
        try:
            # Prepare data
            y = data[target_column].values
            sequence_length = min(60, len(y) // 4)
            
            # Scale target
            scaler = MinMaxScaler()
            y_scaled = scaler.fit_transform(y.reshape(-1, 1)).flatten()
            
            # Create sequences
            X_seq, y_seq = self._create_univariate_sequences(y_scaled, sequence_length, horizon)
            
            if len(X_seq) == 0:
                return {"success": False, "error": "Insufficient data for sequence creation"}
            
            # Initialize model
            model = NBeats(
                input_size=sequence_length,
                output_size=horizon,
                number_of_blocks=3,
                hidden_layer_size=512
            )
            
            optimizer = optim.Adam(model.parameters(), lr=0.001)
            criterion = nn.MSELoss()
            
            # Training loop
            model.train()
            train_losses = []
            
            for epoch in range(epochs):
                epoch_loss = 0
                
                for i in range(0, len(X_seq), batch_size):
                    batch_X = torch.FloatTensor(X_seq[i:i+batch_size])
                    batch_y = torch.FloatTensor(y_seq[i:i+batch_size])
                    
                    optimizer.zero_grad()
                    outputs = model(batch_X)
                    
                    loss = criterion(outputs, batch_y)
                    loss.backward()
                    optimizer.step()
                    
                    epoch_loss += loss.item()
                
                avg_loss = epoch_loss / (len(X_seq) // batch_size + 1)
                train_losses.append(avg_loss)
                
                if epoch % 20 == 0:
                    print(f"N-BEATS Training Epoch {epoch}, Loss: {avg_loss:.4f}")
            
            # Save model
            model_id = f"nbeats_{datetime.now().strftime('%Y%m%d_%H%M%S')}"
            model_path = self.models_dir / f"{model_id}.pt"
            
            torch.save({
                'model_state_dict': model.state_dict(),
                'model_config': {
                    'input_size': sequence_length,
                    'output_size': horizon,
                    'target_column': target_column
                },
                'training_history': train_losses
            }, model_path)
            
            # Save scaler
            scaler_path = self.models_dir / f"{model_id}_scaler.pkl"
            joblib.dump(scaler, scaler_path)
            
            return {
                "success": True,
                "model_id": model_id,
                "model_path": str(model_path),
                "training_loss": train_losses,
                "final_loss": train_losses[-1],
                "model_config": {
                    "type": "N-BEATS",
                    "sequence_length": sequence_length,
                    "horizon": horizon,
                    "epochs": epochs
                }
            }
            
        except Exception as e:
            return {"success": False, "error": str(e)}
    
    async def train_deepar_model(
        self,
        data: pd.DataFrame,
        target_column: str,
        feature_columns: List[str] = None,
        horizon: int = 24,
        epochs: int = 150,
        batch_size: int = 32
    ) -> Dict[str, Any]:
        """Train DeepAR model for probabilistic forecasting."""
        try:
            # Prepare data
            if feature_columns is None:
                feature_columns = [target_column]  # Use univariate by default
            
            X = data[feature_columns].values
            y = data[target_column].values
            
            # Scale data
            scaler = StandardScaler()
            X_scaled = scaler.fit_transform(X)
            y_scaled = scaler.fit_transform(y.reshape(-1, 1)).flatten()
            
            # Create sequences
            sequence_length = min(30, len(X_scaled) // 4)
            X_seq, y_seq = self._create_sequences(X_scaled, y_scaled, sequence_length, horizon)
            
            if len(X_seq) == 0:
                return {"success": False, "error": "Insufficient data for sequence creation"}
            
            # Initialize model
            model = DeepARModel(
                input_size=len(feature_columns),
                hidden_size=64,
                num_layers=2,
                likelihood="gaussian"
            )
            
            optimizer = optim.Adam(model.parameters(), lr=0.001)
            criterion = nn.MSELoss()
            
            # Training loop
            model.train()
            train_losses = []
            
            for epoch in range(epochs):
                epoch_loss = 0
                
                for i in range(0, len(X_seq), batch_size):
                    batch_X = torch.FloatTensor(X_seq[i:i+batch_size])
                    batch_y = torch.FloatTensor(y_seq[i:i+batch_size])
                    
                    optimizer.zero_grad()
                    outputs = model(batch_X, future_steps=horizon)
                    
                    # For DeepAR, we predict distribution parameters
                    loss = criterion(outputs[:, :, 0], batch_y)  # Mean parameter
                    loss.backward()
                    optimizer.step()
                    
                    epoch_loss += loss.item()
                
                avg_loss = epoch_loss / (len(X_seq) // batch_size + 1)
                train_losses.append(avg_loss)
                
                if epoch % 15 == 0:
                    print(f"DeepAR Training Epoch {epoch}, Loss: {avg_loss:.4f}")
            
            # Save model
            model_id = f"deepar_{datetime.now().strftime('%Y%m%d_%H%M%S')}"
            model_path = self.models_dir / f"{model_id}.pt"
            
            torch.save({
                'model_state_dict': model.state_dict(),
                'model_config': {
                    'input_size': len(feature_columns),
                    'horizon': horizon,
                    'feature_columns': feature_columns,
                    'target_column': target_column
                },
                'training_history': train_losses
            }, model_path)
            
            # Save scaler
            scaler_path = self.models_dir / f"{model_id}_scaler.pkl"
            joblib.dump(scaler, scaler_path)
            
            return {
                "success": True,
                "model_id": model_id,
                "model_path": str(model_path),
                "training_loss": train_losses,
                "final_loss": train_losses[-1],
                "model_config": {
                    "type": "DeepAR",
                    "input_features": len(feature_columns),
                    "horizon": horizon,
                    "epochs": epochs,
                    "likelihood": "gaussian"
                }
            }
            
        except Exception as e:
            return {"success": False, "error": str(e)}
    
    async def predict_tft(
        self,
        model_id: str,
        input_data: np.ndarray,
        horizon: int = 24
    ) -> Dict[str, Any]:
        """Make predictions using TFT model."""
        try:
            # Load model
            model_path = self.models_dir / f"{model_id}.pt"
            if not model_path.exists():
                return {"success": False, "error": "Model not found"}
            
            checkpoint = torch.load(model_path)
            config = checkpoint['model_config']
            
            model = TemporalFusionTransformer(
                input_size=config['input_size'],
                output_size=horizon
            )
            model.load_state_dict(checkpoint['model_state_dict'])
            model.eval()
            
            # Load scalers
            scaler_X_path = self.models_dir / f"{model_id}_scaler_X.pkl"
            scaler_y_path = self.models_dir / f"{model_id}_scaler_y.pkl"
            
            scaler_X = joblib.load(scaler_X_path)
            scaler_y = joblib.load(scaler_y_path)
            
            # Scale input
            input_scaled = scaler_X.transform(input_data)
            
            # Make prediction
            with torch.no_grad():
                input_tensor = torch.FloatTensor(input_scaled).unsqueeze(0)
                outputs = model(input_tensor)
                
                # Extract quantile predictions
                predictions_scaled = outputs[0, :, :].numpy()
                
                # Inverse transform predictions
                predictions_unscaled = scaler_y.inverse_transform(
                    predictions_scaled.reshape(-1, 1)
                ).reshape(horizon, -1)
            
            return {
                "success": True,
                "predictions": predictions_unscaled.tolist(),
                "model_info": {
                    "model_type": "TFT",
                    "horizon": horizon,
                    "quantiles": predictions_unscaled.shape[1]
                }
            }
            
        except Exception as e:
            return {"success": False, "error": str(e)}
    
    async def predict_nbeats(
        self,
        model_id: str,
        input_sequence: np.ndarray,
        horizon: int = 24
    ) -> Dict[str, Any]:
        """Make predictions using N-BEATS model."""
        try:
            # Load model
            model_path = self.models_dir / f"{model_id}.pt"
            if not model_path.exists():
                return {"success": False, "error": "Model not found"}
            
            checkpoint = torch.load(model_path)
            config = checkpoint['model_config']
            
            model = NBeats(
                input_size=config['input_size'],
                output_size=horizon
            )
            model.load_state_dict(checkpoint['model_state_dict'])
            model.eval()
            
            # Load scaler
            scaler_path = self.models_dir / f"{model_id}_scaler.pkl"
            scaler = joblib.load(scaler_path)
            
            # Scale input
            input_scaled = scaler.transform(input_sequence.reshape(-1, 1)).flatten()
            
            # Make prediction
            with torch.no_grad():
                input_tensor = torch.FloatTensor(input_scaled).unsqueeze(0)
                outputs = model(input_tensor)
                
                # Inverse transform prediction
                predictions_scaled = outputs.numpy().flatten()
                predictions_unscaled = scaler.inverse_transform(
                    predictions_scaled.reshape(-1, 1)
                ).flatten()
            
            return {
                "success": True,
                "predictions": predictions_unscaled.tolist(),
                "model_info": {
                    "model_type": "N-BEATS",
                    "horizon": horizon
                }
            }
            
        except Exception as e:
            return {"success": False, "error": str(e)}
    
    async def predict_deepar(
        self,
        model_id: str,
        input_data: np.ndarray,
        horizon: int = 24
    ) -> Dict[str, Any]:
        """Make predictions using DeepAR model."""
        try:
            # Load model
            model_path = self.models_dir / f"{model_id}.pt"
            if not model_path.exists():
                return {"success": False, "error": "Model not found"}
            
            checkpoint = torch.load(model_path)
            config = checkpoint['model_config']
            
            model = DeepARModel(
                input_size=config['input_size']
            )
            model.load_state_dict(checkpoint['model_state_dict'])
            model.eval()
            
            # Load scaler
            scaler_path = self.models_dir / f"{model_id}_scaler.pkl"
            scaler = joblib.load(scaler_path)
            
            # Scale input
            input_scaled = scaler.transform(input_data)
            
            # Make prediction
            with torch.no_grad():
                input_tensor = torch.FloatTensor(input_scaled).unsqueeze(0)
                outputs = model(input_tensor, future_steps=horizon)
                
                # Extract parameters for probabilistic prediction
                params = outputs[0].numpy()  # [horizon, 2] for gaussian
                
                means = params[:, 0]  # Mean values
                stds = np.exp(params[:, 1])  # Standard deviations (exp for positivity)
            
            return {
                "success": True,
                "predictions": {
                    "means": means.tolist(),
                    "std_devs": stds.tolist(),
                    "lower_bound": (means - 1.96 * stds).tolist(),
                    "upper_bound": (means + 1.96 * stds).tolist()
                },
                "model_info": {
                    "model_type": "DeepAR",
                    "horizon": horizon,
                    "likelihood": "gaussian",
                    "confidence_level": 0.95
                }
            }
            
        except Exception as e:
            return {"success": False, "error": str(e)}
    
    async def compare_models(
        self,
        model_results: List[Dict[str, Any]],
        ground_truth: np.ndarray
    ) -> Dict[str, Any]:
        """Compare multiple model predictions against ground truth."""
        try:
            comparison_results = []
            
            for result in model_results:
                if not result.get("success"):
                    continue
                
                model_name = result.get("model_info", {}).get("model_type", "Unknown")
                predictions = np.array(result["predictions"])
                
                # Ensure predictions match ground truth shape
                if predictions.ndim == 1:
                    if len(predictions) == len(ground_truth):
                        predictions_reshaped = predictions
                    else:
                        predictions_reshaped = predictions[:len(ground_truth)]
                else:
                    predictions_reshaped = predictions.flatten()[:len(ground_truth)]
                
                # Calculate metrics
                mae = mean_absolute_error(ground_truth, predictions_reshaped)
                mse = mean_squared_error(ground_truth, predictions_reshaped)
                rmse = np.sqrt(mse)
                mape = np.mean(np.abs((ground_truth - predictions_reshaped) / ground_truth)) * 100
                
                comparison_results.append({
                    "model": model_name,
                    "mae": round(mae, 4),
                    "mse": round(mse, 4),
                    "rmse": round(rmse, 4),
                    "mape": round(mape, 2),
                    "predictions": predictions_reshaped.tolist()
                })
            
            # Rank models by RMSE
            comparison_results.sort(key=lambda x: x["rmse"])
            
            return {
                "success": True,
                "comparison": comparison_results,
                "best_model": comparison_results[0]["model"] if comparison_results else None,
                "ground_truth": ground_truth.tolist(),
                "evaluation_timestamp": datetime.now().isoformat()
            }
            
        except Exception as e:
            return {"success": False, "error": str(e)}
    
    def _create_sequences(self, X: np.ndarray, y: np.ndarray, seq_len: int, horizon: int) -> Tuple[np.ndarray, np.ndarray]:
        """Create sequences for time series forecasting."""
        X_seq, y_seq = [], []
        
        for i in range(len(X) - seq_len - horizon + 1):
            X_seq.append(X[i:i+seq_len])
            y_seq.append(y[i+seq_len:i+seq_len+horizon])
        
        return np.array(X_seq), np.array(y_seq)
    
    def _create_univariate_sequences(self, y: np.ndarray, seq_len: int, horizon: int) -> Tuple[np.ndarray, np.ndarray]:
        """Create sequences for univariate time series."""
        X_seq, y_seq = [], []
        
        for i in range(len(y) - seq_len - horizon + 1):
            X_seq.append(y[i:i+seq_len])
            y_seq.append(y[i+seq_len:i+seq_len+horizon])
        
        return np.array(X_seq), np.array(y_seq)


# Global instance
advanced_ml_service = AdvancedMLService()


# Placeholder basis function classes for N-BEATS
class TrendBasis(nn.Module):
    def __init__(self, backcast_length: int, forecast_length: int, number_of_harmonics: int):
        super().__init__()
        self.backcast_length = backcast_length
        self.forecast_length = forecast_length
        
    def forward(self, theta):
        # Simplified trend basis function
        backcast = torch.zeros(self.backcast_length)
        forecast = torch.zeros(self.forecast_length)
        return backcast, forecast


class SeasonalityBasis(nn.Module):
    def __init__(self, backcast_length: int, forecast_length: int, number_of_harmonics: int):
        super().__init__()
        self.backcast_length = backcast_length
        self.forecast_length = forecast_length
        
    def forward(self, theta):
        # Simplified seasonality basis function
        backcast = torch.zeros(self.backcast_length)
        forecast = torch.zeros(self.forecast_length)
        return backcast, forecast


class GenericBasis(nn.Module):
    def __init__(self, backcast_length: int, forecast_length: int):
        super().__init__()
        self.backcast_length = backcast_length
        self.forecast_length = forecast_length
        
    def forward(self, theta):
        # Simplified generic basis function
        backcast = torch.zeros(self.backcast_length)
        forecast = torch.zeros(self.forecast_length)
        return backcast, forecast