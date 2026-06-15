variable "project_name" {
  description = "Project name"
  type        = string
}

variable "ingress_ports" {
  description = "List of Ports allow to inbound traffic on"
  type = list(number)
  default = [ 80, 3000, 22 ]
}

variable "egress_ports" {
  type = list(number)
  default = [ 0 ]
  
}