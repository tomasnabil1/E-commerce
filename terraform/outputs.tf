output "server_ip" {
  description = "Public IP of the server"
  value       = aws_instance.app.public_ip
}
output "vpc_id" {
  description = "VPC ID"
  value       = aws_vpc.main.id
}