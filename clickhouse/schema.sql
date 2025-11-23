-- ClickHouse Schema for OptiBid Analytics
-- Advanced features: materialized views, aggregations, and analytics tables

-- Create database if not exists
CREATE DATABASE IF NOT EXISTS optibid_analytics;

USE optibid_analytics;

-- Raw market data table (ingested from Kafka streams)
CREATE TABLE IF NOT EXISTS market_data_raw (
    timestamp DateTime64(3) CODEC(DoubleDelta, ZSTD),
    market_zone LowCardinality(String),
    price Decimal64(4),
    volume UInt64,
    bid_id String,
    asset_id String,
    created_at DateTime DEFAULT now()
) 
ENGINE = MergeTree()
PARTITION BY toYYYYMM(timestamp)
ORDER BY (market_zone, timestamp)
TTL timestamp + INTERVAL 7 YEAR DELETE;

-- Hourly aggregated market data
CREATE TABLE IF NOT EXISTS hourly_market_data (
    hour DateTime64(3) CODEC(DoubleDelta, ZSTD),
    market_zone LowCardinality(String),
    avg_price Decimal64(4),
    min_price Decimal64(4),
    max_price Decimal64(4),
    total_volume UInt64,
    record_count UInt32,
    price_volatility Decimal64(6),
    created_at DateTime DEFAULT now()
)
ENGINE = SummingMergeTree()
PARTITION BY toYYYYMM(hour)
ORDER BY (market_zone, hour);

-- Daily KPI aggregations
CREATE TABLE IF NOT EXISTS daily_kpi_data (
    day Date,
    market_zone LowCardinality(String),
    daily_avg_price Decimal64(4),
    day_open_price Decimal64(4),
    day_close_price Decimal64(4),
    daily_high Decimal64(4),
    daily_low Decimal64(4),
    daily_volume UInt64,
    trading_count UInt32,
    avg_volume_per_trade Decimal64(4),
    price_stddev Decimal64(6),
    created_at DateTime DEFAULT now()
)
ENGINE = SummingMergeTree()
PARTITION BY toYYYYMM(day)
ORDER BY (market_zone, day);

-- Real-time anomaly detection results
CREATE TABLE IF NOT EXISTS anomaly_data (
    timestamp DateTime64(3) CODEC(DoubleDelta, ZSTD),
    market_zone LowCardinality(String),
    price Decimal64(4),
    volume UInt64,
    price_zscore Decimal64(6),
    volume_zscore Decimal64(6),
    anomaly_type LowCardinality(String),
    severity_level UInt8,
    created_at DateTime DEFAULT now()
)
ENGINE = MergeTree()
PARTITION BY toYYYYMM(timestamp)
ORDER BY (market_zone, timestamp);

-- Model predictions storage
CREATE TABLE IF NOT EXISTS model_predictions (
    prediction_id String,
    model_type LowCardinality(String),
    model_version String,
    market_zone LowCardinality(String),
    forecast_horizon UInt16,
    prediction_timestamp DateTime64(3),
    target_timestamp DateTime64(3),
    predicted_value Decimal64(4),
    confidence_lower Decimal64(4),
    confidence_upper Decimal64(4),
    model_metadata JSON,
    created_at DateTime DEFAULT now()
)
ENGINE = MergeTree()
PARTITION BY toYYYYMM(prediction_timestamp)
ORDER BY (market_zone, prediction_timestamp);

-- ML model performance metrics
CREATE TABLE IF NOT EXISTS model_metrics (
    model_id String,
    model_type LowCardinality(String),
    evaluation_date Date,
    mae Decimal64(6),
    mse Decimal64(6),
    rmse Decimal64(6),
    mape Decimal64(4),
    r2_score Decimal64(4),
    training_samples UInt32,
    test_samples UInt32,
    training_time_seconds UInt32,
    model_size_mb Decimal64(4),
    created_at DateTime DEFAULT now()
)
ENGINE = MergeTree()
ORDER BY (model_type, evaluation_date);

-- Geographic market data
CREATE TABLE IF NOT EXISTS geo_market_data (
    timestamp DateTime64(3) CODEC(DoubleDelta, ZSTD),
    market_zone LowCardinality(String),
    latitude Decimal64(6),
    longitude Decimal64(6),
    price Decimal64(4),
    volume UInt64,
    region String,
    state String,
    created_at DateTime DEFAULT now()
)
ENGINE = MergeTree()
PARTITION BY toYYYYMM(timestamp)
ORDER BY (market_zone, timestamp);

-- Market correlation analysis
CREATE TABLE IF NOT EXISTS market_correlations (
    analysis_date Date,
    zone1 LowCardinality(String),
    zone2 LowCardinality(String),
    price_correlation Decimal64(6),
    volume_correlation Decimal64(6),
    correlation_window_hours UInt8,
    sample_count UInt32,
    significance_level Decimal64(6),
    created_at DateTime DEFAULT now()
)
ENGINE = MergeTree()
ORDER BY (analysis_date, zone1, zone2);

-- Real-time KPI snapshots
CREATE TABLE IF NOT EXISTS realtime_kpi_snapshots (
    snapshot_timestamp DateTime64(3) CODEC(DoubleDelta, ZSTD),
    market_zone LowCardinality(String),
    current_price Decimal64(4),
    price_change_percent Decimal64(4),
    volume_24h UInt64,
    volatility_1h Decimal64(6),
    last_trade_timestamp DateTime64(3),
    trend_direction LowCardinality(String),
    created_at DateTime DEFAULT now()
)
ENGINE = MergeTree()
PARTITION BY toYYYYMM(snapshot_timestamp)
ORDER BY (market_zone, snapshot_timestamp);

-- Create indexes for performance optimization
CREATE INDEX IF NOT EXISTS idx_market_zone ON market_data_raw (market_zone);
CREATE INDEX IF NOT EXISTS idx_timestamp ON market_data_raw (timestamp);
CREATE INDEX IF NOT EXISTS idx_hourly_zone ON hourly_market_data (market_zone);
CREATE INDEX IF NOT EXISTS idx_daily_zone ON daily_kpi_data (market_zone);
CREATE INDEX IF NOT EXISTS idx_anomaly_zone ON anomaly_data (market_zone);
CREATE INDEX IF NOT EXISTS idx_prediction_zone ON model_predictions (market_zone);
CREATE INDEX IF NOT EXISTS idx_realtime_zone ON realtime_kpi_snapshots (market_zone);

-- Create materialized views for automatic aggregation
CREATE MATERIALIZED VIEW IF NOT EXISTS hourly_market_agg_mv
TO hourly_market_data
AS
SELECT
    toStartOfHour(timestamp) as hour,
    market_zone,
    avg(price) as avg_price,
    min(price) as min_price,
    max(price) as max_price,
    sum(volume) as total_volume,
    count() as record_count,
    stddev(price) as price_volatility
FROM market_data_raw
GROUP BY hour, market_zone;

CREATE MATERIALIZED VIEW IF NOT EXISTS daily_kpi_agg_mv
TO daily_kpi_data
AS
SELECT
    toStartOfDay(timestamp) as day,
    market_zone,
    avg(price) as daily_avg_price,
    first_value(price) as day_open_price,
    last_value(price) as day_close_price,
    max(price) as daily_high,
    min(price) as daily_low,
    sum(volume) as daily_volume,
    count() as trading_count,
    avg(volume) as avg_volume_per_trade,
    stddev(price) as price_stddev
FROM market_data_raw
GROUP BY day, market_zone;

CREATE MATERIALIZED VIEW IF NOT EXISTS anomaly_detection_mv
TO anomaly_data
AS
SELECT
    timestamp,
    market_zone,
    price,
    volume,
    (price - avg(price) OVER w) / stddev(price) OVER w as price_zscore,
    (volume - avg(volume) OVER w) / stddev(volume) OVER w as volume_zscore,
    CASE
        WHEN abs((price - avg(price) OVER w) / stddev(price) OVER w) > 2.5 THEN 'price_anomaly'
        WHEN abs((volume - avg(volume) OVER w) / stddev(volume) OVER w) > 2.5 THEN 'volume_anomaly'
        ELSE 'normal'
    END as anomaly_type,
    CASE
        WHEN abs((price - avg(price) OVER w) / stddev(price) OVER w) > 3.0 THEN 3
        WHEN abs((price - avg(price) OVER w) / stddev(price) OVER w) > 2.5 THEN 2
        ELSE 1
    END as severity_level
FROM market_data_raw
WINDOW w AS (
    PARTITION BY market_zone 
    ORDER BY timestamp 
    ROWS BETWEEN 23 PRECEDING AND CURRENT ROW
);

-- Optimize tables
OPTIMIZE TABLE market_data_raw FINAL;
OPTIMIZE TABLE hourly_market_data FINAL;
OPTIMIZE TABLE daily_kpi_data FINAL;
OPTIMIZE TABLE anomaly_data FINAL;
OPTIMIZE TABLE model_predictions FINAL;
OPTIMIZE TABLE geo_market_data FINAL;
OPTIMIZE TABLE realtime_kpi_snapshots FINAL;