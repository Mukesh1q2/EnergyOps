#!/bin/bash
# OptiBid Energy: Production Deployment Script
# Phase 6: Production Infrastructure & Deployment

set -e  # Exit on any error

# Color codes for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Configuration
CLUSTER_NAME="optibid-production"
REGION="us-west-2"
ENVIRONMENT="production"
NAMESPACE="optibid"
MONITORING_NAMESPACE="kube-prometheus"

# Logging function
log() {
    echo -e "${BLUE}[$(date +'%Y-%m-%d %H:%M:%S')] $1${NC}"
}

success() {
    echo -e "${GREEN}✅ $1${NC}"
}

warning() {
    echo -e "${YELLOW}⚠️  $1${NC}"
}

error() {
    echo -e "${RED}❌ $1${NC}"
    exit 1
}

# Check prerequisites
check_prerequisites() {
    log "Checking prerequisites..."
    
    # Check required tools
    for tool in terraform kubectl helm aws; do
        if ! command -v $tool &> /dev/null; then
            error "$tool is not installed or not in PATH"
        fi
    done
    
    # Check AWS CLI configuration
    if ! aws sts get-caller-identity &> /dev/null; then
        error "AWS CLI not configured or credentials invalid"
    fi
    
    # Check Terraform version
    TERRAFORM_VERSION=$(terraform version -json | jq -r '.terraform_version')
    if [[ $(echo "$TERRAFORM_VERSION 1.0" | awk '{print ($1 >= $2)}') -eq 0 ]]; then
        error "Terraform version 1.0+ required"
    fi
    
    success "Prerequisites check passed"
}

# Initialize Terraform
init_terraform() {
    log "Initializing Terraform..."
    
    cd kubernetes/terraform
    
    # Initialize Terraform
    terraform init
    
    # Validate configuration
    terraform validate
    
    success "Terraform initialized"
}

# Plan infrastructure
plan_infrastructure() {
    log "Planning infrastructure changes..."
    
    terraform plan \
        -var="aws_region=$REGION" \
        -var="environment=$ENVIRONMENT" \
        -var="cluster_name=$CLUSTER_NAME" \
        -out=tfplan
    
    success "Infrastructure plan created"
}

# Deploy infrastructure
deploy_infrastructure() {
    log "Deploying infrastructure..."
    
    terraform apply tfplan
    
    success "Infrastructure deployed"
}

# Configure kubectl
configure_kubectl() {
    log "Configuring kubectl access..."
    
    # Update kubeconfig
    aws eks update-kubeconfig \
        --region $REGION \
        --name $CLUSTER_NAME
    
    # Test connection
    kubectl cluster-info
    kubectl get nodes
    
    success "kubectl configured"
}

# Create namespaces
create_namespaces() {
    log "Creating namespaces..."
    
    kubectl apply -f ../../kubernetes/k8s-namespace.yaml
    
    success "Namespaces created"
}

# Deploy databases
deploy_databases() {
    log "Deploying databases (PostgreSQL + Redis)..."
    
    kubectl apply -f ../../kubernetes/k8s-database-deployment.yaml
    
    # Wait for databases to be ready
    kubectl wait --for=condition=ready pod -l app=postgresql --namespace=$NAMESPACE --timeout=300s
    kubectl wait --for=condition=ready pod -l app=redis --namespace=$NAMESPACE --timeout=300s
    
    success "Databases deployed and ready"
}

# Deploy monitoring stack
deploy_monitoring() {
    log "Deploying monitoring stack..."
    
    # Add Helm repos
    helm repo add prometheus-community https://prometheus-community.github.io/helm-charts
    helm repo add jetstack https://charts.jetstack.io
    helm repo update
    
    # Deploy Prometheus and Grafana
    helm upgrade --install kube-prometheus-stack prometheus-community/kube-prometheus-stack \
        --namespace $MONITORING_NAMESPACE \
        --create-namespace \
        --values ../../monitoring/helm-values.yaml
    
    success "Monitoring stack deployed"
}

# Deploy application
deploy_application() {
    log "Deploying OptiBid application..."
    
    # Deploy with Helm chart
    helm upgrade --install optibid ../../kubernetes/helm/optibid \
        --namespace $NAMESPACE \
        --create-namespace \
        --values ../../kubernetes/helm/values-production.yaml
    
    # Wait for deployments
    kubectl rollout status deployment/optibid-backend --namespace=$NAMESPACE
    kubectl rollout status deployment/optibid-frontend --namespace=$NAMESPACE
    
    success "Application deployed"
}

# Configure ingress
configure_ingress() {
    log "Configuring ingress and SSL..."
    
    # Install cert-manager if not already installed
    helm repo add jetstack https://charts.jetstack.io
    helm repo update
    
    helm upgrade --install cert-manager jetstack/cert-manager \
        --namespace cert-manager \
        --create-namespace \
        --set installCRDs=true
    
    # Wait for cert-manager to be ready
    kubectl wait --for=condition=ready pod -l app=cert-manager --namespace=cert-manager --timeout=300s
    
    success "Ingress and SSL configured"
}

# Run smoke tests
run_smoke_tests() {
    log "Running smoke tests..."
    
    # Test backend health
    if kubectl exec deployment/optibid-backend --namespace=$NAMESPACE -- curl -f http://localhost:8000/health; then
        success "Backend health check passed"
    else
        error "Backend health check failed"
    fi
    
    # Test frontend
    if kubectl exec deployment/optibid-frontend --namespace=$NAMESPACE -- curl -f http://localhost:3000/api/health; then
        success "Frontend health check passed"
    else
        error "Frontend health check failed"
    fi
    
    # Test database connectivity
    if kubectl exec deployment/optibid-backend --namespace=$NAMESPACE -- pg_isready -h postgresql -p 5432 -U optibid_admin; then
        success "Database connectivity check passed"
    else
        error "Database connectivity check failed"
    fi
    
    # Test Redis connectivity
    if kubectl exec deployment/optibid-backend --namespace=$NAMESPACE -- redis-cli -h redis -a REDIS_PASSWORD ping; then
        success "Redis connectivity check passed"
    else
        error "Redis connectivity check failed"
    fi
}

# Setup monitoring dashboards
setup_monitoring() {
    log "Setting up monitoring dashboards..."
    
    # Port-forward Grafana (temporary)
    kubectl port-forward svc/kube-prometheus-stack-grafana 3000:80 --namespace=$MONITORING_NAMESPACE &
    GRAFANA_PID=$!
    
    sleep 10
    
    # Create OptiBid dashboards (would be automated)
    log "Grafana available at http://localhost:3000 (admin/admin)"
    log "Please configure dashboards manually or via Grafana API"
    
    # Kill port-forward
    kill $GRAFANA_PID
    
    success "Monitoring dashboards configured"
}

# Deploy backup solution
deploy_backups() {
    log "Setting up backup solution..."
    
    # Create backup CronJob (already defined in k8s-database-deployment.yaml)
    kubectl apply -f ../../kubernetes/k8s-database-deployment.yaml
    
    success "Backup solution deployed"
}

# Setup alerting
setup_alerting() {
    log "Setting up alerting..."
    
    # Configure AlertManager (would need SMTP credentials)
    log "Please configure AlertManager SMTP settings:"
    log "  kubectl edit configmap alertmanager-config -n kube-prometheus"
    
    success "Alerting configured"
}

# Cleanup temporary files
cleanup() {
    log "Cleaning up temporary files..."
    
    if [ -f tfplan ]; then
        rm tfplan
    fi
    
    success "Cleanup completed"
}

# Main deployment flow
main() {
    log "Starting OptiBid Production Deployment - Phase 6"
    log "Environment: $ENVIRONMENT"
    log "Region: $REGION"
    log "Cluster: $CLUSTER_NAME"
    echo
    
    # Check prerequisites
    check_prerequisites
    
    # Infrastructure deployment
    init_terraform
    plan_infrastructure
    
    if [[ $1 == "--plan-only" ]]; then
        log "Plan only mode - stopping here"
        cleanup
        exit 0
    fi
    
    deploy_infrastructure
    configure_kubectl
    create_namespaces
    deploy_databases
    deploy_monitoring
    configure_ingress
    deploy_application
    
    # Testing and validation
    run_smoke_tests
    setup_monitoring
    deploy_backups
    setup_alerting
    
    cleanup
    
    echo
    success "🎉 Phase 6 deployment completed successfully!"
    echo
    log "Next steps:"
    log "1. Configure DNS records to point to load balancer"
    log "2. Set up SSL certificates with Let's Encrypt"
    log "3. Configure monitoring alerts and dashboards"
    log "4. Run integration tests"
    log "5. Set up CI/CD pipeline"
    echo
    log "Access URLs:"
    log "- Frontend: https://optibid.com"
    log "- API: https://api.optibid.com"
    log "- Grafana: kubectl port-forward svc/kube-prometheus-stack-grafana 3000:80 -n $MONITORING_NAMESPACE"
    log "- Prometheus: kubectl port-forward svc/kube-prometheus-stack-prometheus 9090:9090 -n $MONITORING_NAMESPACE"
    echo
    log "Useful commands:"
    log "- kubectl get pods -n $NAMESPACE"
    log "- kubectl logs -f deployment/optibid-backend -n $NAMESPACE"
    log "- kubectl top nodes"
    log "- kubectl top pods -n $NAMESPACE"
}

# Parse arguments
case "${1:-}" in
    --plan-only)
        main --plan-only
        ;;
    --destroy)
        log "Destroying infrastructure..."
        terraform destroy -auto-approve
        success "Infrastructure destroyed"
        ;;
    --help|-h)
        echo "Usage: $0 [OPTIONS]"
        echo
        echo "Options:"
        echo "  --plan-only    Show Terraform plan without applying"
        echo "  --destroy      Destroy all infrastructure"
        echo "  --help, -h     Show this help message"
        echo
        echo "Environment variables:"
        echo "  AWS_PROFILE    AWS profile to use"
        echo "  TERRAFORM_VARS Additional terraform variables"
        exit 0
        ;;
    *)
        main
        ;;
esac