variable "region" {
  description = "AWS region"
  type        = string
  default     = "us-east-1"
}

variable "project_name" {
  description = "Project name"
  type        = string
  default     = "e-commerce"
}

variable "vms" {
  description = "Map of VM configuration"
  type = map(object({
    instance_type      = string
    ami                = string
    disk_size          = number
    attach_extra_disks = bool
    extra_disks = list(object({
      name      = string
      disk_size = number
      type      = string
      mount     = string
      device    = string
    }))
  }))
}