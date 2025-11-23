# OptiBid Energy: Terraform Infrastructure as Code
# AWS EKS Production Cluster with Multi-AZ Deployment

terraform {
  required_version = ">= 1.0"
  required_providers {
    aws = {
      source  = "hashicorp/aws"
      version = "~> 5.0"
    }
    kubernetes = {
      source  = "hashicorp/kubernetes"
      version = ">= 2.0"
    }
    helm = {
      source  = "hashicorp/helm"
      version = ">= 2.0"
    }
  }
  
  backend "s3" {
    bucket = "optibid-terraform-state"
    key    = "production/terraform.tfstate"
    region = "us-west-2"
    encrypt = true
  }
}

# Provider Configuration
provider "aws" {
  region = var.aws_region
  
  default_tags {
    tags = {
      Environment = var.environment
      Project     = "OptiBid"
      ManagedBy   = "Terraform"
    }
  }
}

provider "kubernetes" {
  host                   = data.aws_eks_cluster.cluster.endpoint
  token                  = data.aws_eks_cluster_auth.cluster.token
  cluster_ca_certificate = base64decode(data.aws_eks_cluster.cluster.certificate_authority[0].data)
}

provider "helm" {
  kubernetes {
    host                   = data.aws_eks_cluster.cluster.endpoint
    token                  = data.aws_eks_cluster_auth.cluster.token
    cluster_ca_certificate = base64decode(data.aws_eks_cluster.cluster.certificate_authority[0].data)
  }
}

# Variables
variable "aws_region" {
  description = "AWS region for resources"
  type        = string
  default     = "us-west-2"
}

variable "environment" {
  description = "Environment name"
  type        = string
  default     = "production"
}

variable "cluster_name" {
  description = "EKS cluster name"
  type        = string
  default     = "optibid-production"
}

variable "cluster_version" {
  description = "Kubernetes version for EKS cluster"
  type        = string
  default     = "1.28"
}

variable "node_groups" {
  description = "EKS node group configurations"
  type = map(object({
    instance_types = list(string)
    capacity_type  = string
    desired_size   = number
    max_size       = number
    min_size       = number
    ami_type       = string
  }))
  default = {
    compute = {
      instance_types = ["m5.xlarge", "m5.2xlarge"]
      capacity_type  = "ON_DEMAND"
      desired_size   = 3
      max_size       = 10
      min_size       = 3
      ami_type       = "AL2_x86_64"
    }
    memory = {
      instance_types = ["r5.xlarge", "r5.2xlarge"]
      capacity_type  = "ON_DEMAND"
      desired_size   = 2
      max_size       = 6
      min_size       = 2
      ami_type       = "AL2_x86_64"
    }
  }
}

variable "vpc_cidr" {
  description = "CIDR block for VPC"
  type        = string
  default     = "10.0.0.0/16"
}

variable "availability_zones" {
  description = "Availability zones for deployment"
  type        = list(string)
  default     = ["us-west-2a", "us-west-2b", "us-west-2c"]
}

variable "enable_monitoring" {
  description = "Enable monitoring and observability"
  type        = bool
  default     = true
}

variable "enable_backups" {
  description = "Enable automated backups"
  type        = bool
  default     = true
}

# Local Values
locals {
  cluster_name = "${var.cluster_name}-${var.environment}"
  tags = {
    Environment = var.environment
    Project     = "OptiBid"
    ManagedBy   = "Terraform"
    Team        = "Platform"
  }
}

# Data Sources
data "aws_availability_zones" "available" {
  state = "available"
}

data "aws_eks_cluster" "cluster" {
  name = module.eks.cluster_name
}

data "aws_eks_cluster_auth" "cluster" {
  name = module.eks.cluster_name
}

# VPC Module
module "vpc" {
  source = "terraform-aws-modules/vpc/aws"
  
  name = "optibid-vpc"
  cidr = var.vpc_cidr
  
  azs             = var.availability_zones
  private_subnets = [for az in var.availability_zones : "10.0.${index(var.availability_zones, az) + 1}.0/24"]
  public_subnets  = [for az in var.availability_zones : "10.0.${index(var.availability_zones, az) + 10}.0/24"]
  
  enable_nat_gateway   = true
  single_nat_gateway   = false
  enable_dns_hostnames = true
  enable_dns_support   = true
  
  public_subnet_tags = {
    "kubernetes.io/role/elb" = "1"
    "kubernetes.io/cluster/${local.cluster_name}" = "shared"
  }
  
  private_subnet_tags = {
    "kubernetes.io/role/internal-elb" = "1"
    "kubernetes.io/cluster/${local.cluster_name}" = "shared"
  }
  
  tags = local.tags
}

# EKS Module
module "eks" {
  source = "terraform-aws-modules/eks/aws"
  
  cluster_name    = local.cluster_name
  cluster_version = var.cluster_version
  
  vpc_id                         = module.vpc.vpc_id
  subnet_ids                     = module.vpc.private_subnets
  cluster_endpoint_private_access = true
  cluster_endpoint_public_access  = true
  cluster_endpoint_public_access_cidrs = ["0.0.0.0/0"]
  
  # EKS Add-ons
  cluster_addons = {
    coredns = {
      most_recent = true
    }
    kube-proxy = {
      most_recent = true
    }
    vpc-cni = {
      most_recent = true
    }
    aws-ebs-csi-driver = {
      most_recent = true
    }
  }
  
  # Cluster Security Group
  cluster_security_group_additional_rules = {
    ingress_nodes_ephemeral_tcp = {
      description                = "Nodes on ephemeral ports"
      protocol                   = "tcp"
      from_port                  = 1025
      to_port                    = 65535
      type                       = "ingress"
      source_node_security_group = true
    }
  }
  
  # Node Security Group
  node_security_group_additional_rules = {
    ingress_cluster_all = {
      description                   = "All traffic from cluster"
      protocol                      = "-1"
      from_port                     = 0
      to_port                       = 0
      type                          = "ingress"
      source_cluster_security_group = true
    }
  }
  
  # EKS Managed Node Groups
  eks_managed_node_groups = {
    compute = {
      name = "compute"
      
      instance_types = var.node_groups.compute.instance_types
      capacity_type  = var.node_groups.compute.capacity_type
      ami_type       = var.node_groups.compute.ami_type
      
      min_size     = var.node_groups.compute.min_size
      max_size     = var.node_groups.compute.max_size
      desired_size = var.node_groups.compute.desired_size
      
      labels = {
        Environment = var.environment
        NodeType    = "compute"
      }
      
      taints = {
        compute = {
          key    = "compute"
          value  = "true"
          effect = "NO_SCHEDULE"
        }
      }
      
      update_config = {
        max_unavailable_percentage = 25
      }
      
      tags = local.tags
    }
    
    memory = {
      name = "memory"
      
      instance_types = var.node_groups.memory.instance_types
      capacity_type  = var.node_groups.memory.capacity_type
      ami_type       = var.node_groups.memory.ami_type
      
      min_size     = var.node_groups.memory.min_size
      max_size     = var.node_groups.memory.max_size
      desired_size = var.node_groups.memory.desired_size
      
      labels = {
        Environment = var.environment
        NodeType    = "memory"
      }
      
      taints = {
        memory = {
          key    = "memory"
          value  = "true"
          effect = "NO_SCHEDULE"
        }
      }
      
      update_config = {
        max_unavailable_percentage = 25
      }
      
      tags = local.tags
    }
  }
  
  tags = local.tags
}

# EKS Cluster Auth Module
module "eks_auth" {
  source = "terraform-aws-modules/eks/aws//modules/eks-auth"
  
  cluster_name      = module.eks.cluster_name
  kubernetes_token  = data.aws_eks_cluster_auth.cluster.token
  eks_cluster_host  = data.aws_eks_cluster.cluster.endpoint
  eks_cluster_ca    = base64decode(data.aws_eks_cluster.cluster.certificate_authority[0].data)
}

# AWS Load Balancer Controller
resource "helm_release" "aws_lb_controller" {
  name             = "aws-load-balancer-controller"
  repository       = "https://aws.github.io/eks-charts"
  chart            = "aws-load-balancer-controller"
  namespace        = "kube-system"
  create_namespace = true
  version          = "1.6.2"
  
  set {
    name  = "clusterName"
    value = module.eks.cluster_name
  }
  
  set {
    name  = "region"
    value = var.aws_region
  }
  
  set {
    name  = "vpcId"
    value = module.vpc.vpc_id
  }
  
  set {
    name  = "image.repository"
    value = "602401143452.dkr.ecr.${var.aws_region}.amazonaws.com/eks/aws-load-balancer-controller"
  }
}

# EBS CSI Driver
resource "helm_release" "ebs_csi_driver" {
  name             = "aws-ebs-csi-driver"
  repository       = "https://kubernetes-sigs.github.io/aws-ebs-csi-driver"
  chart            = "aws-ebs-csi-driver"
  namespace        = "kube-system"
  create_namespace = true
  version          = "2.25.0"
  
  set {
    name  = "controller.serviceAccount.create"
    value = "true"
  }
  
  set {
    name  = "controller.serviceAccount.annotations.eks\\.amazonaws\\.com/role-arn"
    value = module.eks.irsa_role_arn
  }
}

# Monitoring Stack (if enabled)
resource "helm_release" "prometheus" {
  count = var.enable_monitoring ? 1 : 0
  
  name             = "kube-prometheus-stack"
  repository       = "https://prometheus-community.github.io/helm-charts"
  chart            = "kube-prometheus-stack"
  namespace        = "monitoring"
  create_namespace = true
  version          = "48.3.1"
  
  values = [<<EOF
grafana:
  enabled: true
  adminPassword: "CHANGE_ME_GRAFANA_PASSWORD"
  persistence:
    enabled: true
    size: 5Gi
  
prometheus:
  enabled: true
  prometheusSpec:
    retention: 30d
    storageSpec:
      volumeClaimTemplate:
        spec:
          storageClassName: gp3
          accessModes: ["ReadWriteOnce"]
          resources:
            requests:
              storage: 10Gi
  
alertmanager:
  enabled: true
  
prometheusOperator:
  enabled: true
  
prometheus-node-exporter:
  enabled: true

kube-state-metrics:
  enabled: true

defaultRules:
  create: true
  
additionalPrometheusRulesMap:
  optibid-rules:
    groups:
    - name: optibid.rules
      rules:
      - alert: HighErrorRate
        expr: rate(http_requests_total{status=~"5.."}[5m]) > 0.1
        for: 5m
        labels:
          severity: critical
        annotations:
          summary: "High error rate detected"
          description: "Error rate is {{ $value }} errors per second"
EOF
  ]
}

# Cert Manager
resource "helm_release" "cert_manager" {
  name             = "cert-manager"
  repository       = "https://charts.jetstack.io"
  chart            = "cert-manager"
  namespace        = "cert-manager"
  create_namespace = true
  version          = "1.13.2"
  
  set {
    name  = "installCRDs"
    value = "true"
  }
}

# Cluster Issuers
resource "kubernetes_manifest" "letsencrypt_issuer" {
  count = 1
  
  manifest = {
    apiVersion = "cert-manager.io/v1"
    kind       = "ClusterIssuer"
    metadata = {
      name = "letsencrypt-prod"
    }
    spec = {
      acme = {
        server = "https://acme-v02.api.letsencrypt.org/directory"
        email  = "devops@optibid.com"
        privateKeySecretRef = {
          name = "letsencrypt-prod"
        }
        solvers = [{
          http01 = {
            ingress = {
              class = "nginx"
            }
          }
        }]
      }
    }
  }
}

# Storage Classes
resource "kubernetes_storage_class_v1" "gp3" {
  metadata {
    name = "gp3"
    annotations = {
      "storageclass.kubernetes.io/is-default-class" = "true"
    }
  }
  
  storage_provisioner = "ebs.csi.aws.com"
  volume_binding_mode = "WaitForFirstConsumer"
  allow_volume_expansion = true
  
  parameters = {
    type                        = "gp3"
    iops                        = "3000"
    throughput                  = "125"
    encrypted                   = "true"
    "kms-key-id"               = "alias/aws/ebs"
  }
}

resource "kubernetes_storage_class_v1" "io2" {
  metadata {
    name = "io2"
  }
  
  storage_provisioner = "ebs.csi.aws.com"
  volume_binding_mode = "WaitForFirstConsumer"
  allow_volume_expansion = true
  
  parameters = {
    type                        = "io2"
    iops                        = "1000"
    encrypted                   = "true"
    "kms-key-id"               = "alias/aws/ebs"
  }
}

# Outputs
output "cluster_endpoint" {
  description = "Endpoint for EKS control plane"
  value       = data.aws_eks_cluster.cluster.endpoint
}

output "cluster_security_group_id" {
  description = "Security group ids attached to the cluster control plane"
  value       = module.eks.cluster_security_group_id
}

output "cluster_iam_role_name" {
  description = "IAM role name associated with EKS cluster"
  value       = module.eks.cluster_iam_role_name
}

output "cluster_certificate_authority_data" {
  description = "Base64 encoded certificate data required to communicate with the cluster"
  value       = data.aws_eks_cluster.cluster.certificate_authority[0].data
}

output "cluster_name" {
  description = "The name/id of the EKS cluster"
  value       = module.eks.cluster_name
}

output "region" {
  description = "AWS region"
  value       = var.aws_region
}

output "vpc_id" {
  description = "ID of the VPC where the cluster is deployed"
  value       = module.vpc.vpc_id
}

output "private_subnets" {
  description = "List of IDs of private subnets"
  value       = module.vpc.private_subnets
}

output "public_subnets" {
  description = "List of IDs of public subnets"
  value       = module.vpc.public_subnets
}