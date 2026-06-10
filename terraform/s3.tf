resource "aws_s3_bucket_versioning" "terraform_state" {
  bucket = "e-commerce-terraform-state-thomas-2026"

  versioning_configuration {
    status = "Enabled"
  }
}