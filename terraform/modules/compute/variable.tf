variable "project_name" {
  type = string
}

variable "subnet_id" {
  type = string
}

variable "security_group_id" {
  type = string
}

variable "key_name" {
  type = string
}

variable "vms" {
  description = "Map of VM configration"
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





