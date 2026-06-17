output "instance_ips" {
  value = module.compute.instance_ips
}

output "vpc_id" {
  value = module.network.vpc_id
}
