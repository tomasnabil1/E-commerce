output "server_ip" {
  description = "Public IP of the server"
  value       = aws_instance.app.public_ip
}

output "server_ip_2"{
  description = "Public IP of the server 2"
  value       = aws_instance.app2.public_ip
}

output "vpc_id" {
  description = "VPC ID"
  value       = aws_vpc.main.id
}