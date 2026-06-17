region       = "us-east-1"
project_name = "e-commerce"

vms = {
  app = {
    instance_type      = "t3.micro"
    disk_size          = 20
    ami                = "ami-0c7217cdde317cfec"
    attach_extra_disks = false
    extra_disks        = []
  }
  db_vm = {
    instance_type      = "t3.micro"
    ami                = "ami-0c02fb55956c7d316"
    disk_size          = 50
    attach_extra_disks = true
    extra_disks = [{
      name      = "logs_disk"
      disk_size = 15
      type      = "gp2"
      mount     = "/var/log"
      device    = "/dev/xvdf"
      }, {
      name      = "data_disk"
      disk_size = 30
      type      = "gp3"
      mount     = "/lib/mongo/data"
      device    = "/dev/xvdg"
    }]
  }
  bastion = {
    instance_type      = "t3.micro"
    ami                = "ami-0c02fb55956c7d316"
    disk_size          = 50
    attach_extra_disks = false
    extra_disks        = []
  }
}
