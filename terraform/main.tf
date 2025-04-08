provider "azurerm" {
  features {}
  subscription_id = "e4430928-3be8-4ca2-970c-3d5a0e994047"
}

resource "azurerm_resource_group" "vicini" {
  name     = "vicini-resources"
  location = var.location
}

resource "azurerm_app_service_plan" "vicini" {
  name                = "vicini-appserviceplan"
  location            = azurerm_resource_group.vicini.location
  resource_group_name = azurerm_resource_group.vicini.name
  kind                = "Linux"
  reserved            = true

  sku {
    tier = "Basic"
    size = "B1"
  }
}

resource "azurerm_app_service" "vicini" {
  name                = "vicini-app"
  location            = azurerm_resource_group.vicini.location
  resource_group_name = azurerm_resource_group.vicini.name
  app_service_plan_id = azurerm_app_service_plan.vicini.id

  site_config {
    linux_fx_version = "NODE|16-lts"
    always_on        = true
    cors {
      allowed_origins = ["*"]
    }
  }

  app_settings = {
    "WEBSITE_NODE_DEFAULT_VERSION" = "~16"
    "WEBSITE_RUN_FROM_PACKAGE"     = "1"
    "NODE_ENV"                     = "production"
  }
}

output "app_url" {
  value = "https://${azurerm_app_service.vicini.default_site_hostname}"
}
