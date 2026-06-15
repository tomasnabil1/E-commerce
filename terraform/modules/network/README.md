# Network Module

This module creates and manages all networking resources required for the
e-commerce infrastructure on AWS. It provisions a VPC, subnet, internet
gateway, and routing, and optionally provisions a security group with
configurable firewall rules.

## Resources Created

- `aws_vpc` – Main VPC for the project
- `aws_subnet` – Public subnet with auto-assigned public IPs
- `aws_internet_gateway` – Internet gateway attached to the VPC
- `aws_route_table` / `aws_route_table_association` – Default route to the
  internet gateway for the public subnet
- `aws_security_group` *(optional)* – Firewall rules controlling inbound and
  outbound traffic for instances in the VPC

## Optional Security & Firewall Features

The security group is optional and controlled by `enable_security_group`.
When enabled, inbound rules are driven by the `ingress_rules` variable so
callers can define exactly which ports/protocols/sources are allowed
(e.g. SSH, HTTP, application ports) instead of relying on hardcoded values.
Egress traffic defaults to allow-all but can be restricted via
`egress_rules`.

## Usage

```hcl
module "network" {
  source       = "./modules/network"
  project_name = var.project_name

  enable_security_group = true

  ingress_rules = [
    { description = "HTTP",  from_port = 80,   to_port = 80,   protocol = "tcp", cidr_blocks = ["0.0.0.0/0"] },
    { description = "SSH",   from_port = 22,   to_port = 22,   protocol = "tcp", cidr_blocks = ["0.0.0.0/0"] },
    { description = "App",   from_port = 3000, to_port = 3000, protocol = "tcp", cidr_blocks = ["0.0.0.0/0"] },
  ]
}
```

## Inputs

| Name                     | Description                                         | Type           | Default |
|--------------------------|------------------------------------------------------|----------------|---------|
| `project_name`           | Name prefix used for tagging all resources           | `string`       | n/a     |
| `vpc_cidr`                | CIDR block for the VPC                                | `string`       | `10.0.0.0/16` |
| `subnet_cidr`             | CIDR block for the public subnet                      | `string`       | `10.0.1.0/24` |
| `enable_security_group`   | Whether to create the security group                  | `bool`         | `true`  |
| `ingress_rules`           | List of ingress rules (description, ports, protocol, cidr_blocks) | `list(object)` | see defaults |
| `egress_rules`            | List of egress rules                                   | `list(object)` | allow all |

## Outputs

| Name                | Description                       |
|---------------------|------------------------------------|
| `vpc_id`            | ID of the created VPC              |
| `subnet_id`         | ID of the public subnet            |
| `security_group_id` | ID of the security group (if created) |
| `route_table_id`    | ID of the route table              |
