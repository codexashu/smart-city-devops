output "server_public_ip" {
  description = "Public IP address of the deployed SmartCity server"
  value       = aws_instance.smartcity_server.public_ip
}

output "web_app_url" {
  description = "URL to access the SmartCity Frontend application"
  value       = "http://${aws_instance.smartcity_server.public_ip}"
}

output "api_url" {
  description = "URL to access the FastAPI Backend REST endpoints"
  value       = "http://${aws_instance.smartcity_server.public_ip}:8000"
}

output "grafana_dashboard_url" {
  description = "URL to access Grafana Dashboards"
  value       = "http://${aws_instance.smartcity_server.public_ip}:3001"
}

output "s3_bucket_name" {
  description = "S3 bucket for storing citizen complaints images"
  value       = aws_s3_bucket.complaint_media_bucket.id
}
