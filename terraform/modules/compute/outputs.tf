output "instance_ips" {
  value = {
    for name, instance in aws_instance.vms :
    name => instance.public_ip
  }
}
