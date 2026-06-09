terraform { 

required_providers {
  
  aws = {
      source = "hashicorp/aws"
      version = "~> 5.0"
  }

}

backend "s3" {
   
   bucket = "e-commerce-terraform-state-thomas-2026"
   key    = "terraform.tfstate"
   region = "us-east-1"

}
}

provider "aws" {
   region = var.region 
}