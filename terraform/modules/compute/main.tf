resource "aws_instance" "vms" {
  for_each               = var.vms
  ami                    = each.value.ami
  instance_type          = each.value.instance_type
  subnet_id              = var.subnet_id
  vpc_security_group_ids = [var.security_group_id]
  key_name               = var.key_name

  root_block_device {
    volume_size = each.value.disk_size
  }

  tags = {
    Name = "${var.project_name}-${each.key}"
  }
}

resource "aws_ebs_volume" "extra_disks" {
  for_each = {
    for disk in flatten([
      for vm_name, vm in var.vms : [
        for disk in vm.extra_disks : {
          key       = "${vm_name}-${disk.name}"
          vm_name   = vm_name
          disk_size = disk.disk_size
          type      = disk.type
        }
      ] if vm.attach_extra_disks
    ]) : disk.key => disk
  }

  availability_zone = aws_instance.vms[each.value.vm_name].availability_zone
  size              = each.value.disk_size
  type              = each.value.type

  tags = {
    Name = "${var.project_name}-${each.key}"
  }
}

resource "aws_volume_attachment" "attach" {
  for_each    = aws_ebs_volume.extra_disks
  device_name = [for d in flatten([for vm in var.vms : vm.extra_disks]) : d.device if d.name == split("-", each.key)[1]][0]
  volume_id   = each.value.id
  instance_id = aws_instance.vms[split("-", each.key)[0]].id
}
