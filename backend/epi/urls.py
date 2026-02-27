from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import (
    EPIViewSet, EstoqueEPIViewSet, FuncionarioViewSet,
    MatrizFuncaoEPIViewSet, EntregaEPIViewSet, TrocaEPIViewSet, UsuarioViewSet,
    monitor_validade, kpis, alertas_minimo
)

router = DefaultRouter()
router.register(r"epis", EPIViewSet)
router.register(r"estoques", EstoqueEPIViewSet)
router.register(r"funcionarios", FuncionarioViewSet)
router.register(r"matriz-funcao-epi", MatrizFuncaoEPIViewSet)
router.register(r"entregas", EntregaEPIViewSet)
router.register(r"trocas", TrocaEPIViewSet)
router.register(r'usuarios', UsuarioViewSet)

urlpatterns = [
    path("", include(router.urls)),
    path("monitor/validade/", monitor_validade),
    path("dashboard/kpis/", kpis),
    path("estoques/alertas-minimo/", alertas_minimo),
]
