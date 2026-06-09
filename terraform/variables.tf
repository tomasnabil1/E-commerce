variable "region" {
  description = "AWS region"
  type        = string
  default     = "us-east-1"
}

variable "instance_type" {
  description = "EC2 instance type"
  type        = string
  default     = "t3.micro"
}

variable "ami" {
  description = "AMI ID"
  type        = string
}

variable "project_name" {
  description = "Project name"
  type        = string
  default     = "e-commerce"
}