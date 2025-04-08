variable "location" {
  description = "The Azure region where resources will be created"
  type        = string
  default     = "West Europe"
}

variable "environment" {
  description = "The environment (dev, test, prod)"
  type        = string
  default     = "dev"
}
