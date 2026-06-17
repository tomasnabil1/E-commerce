module "network" {
  source       = "./modules/network"
  project_name = var.project_name
}

module "compute" {
  source            = "./modules/compute"
  project_name      = var.project_name
  subnet_id         = module.network.subnet_id
  security_group_id = module.network.security_group_id
  key_name          = "e-commerce-key"
  vms               = var.vms
}
 

