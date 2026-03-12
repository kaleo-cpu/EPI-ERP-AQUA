import os

os.environ.setdefault("DJANGO_SETTINGS_MODULE", "epi_manager.settings")

import django
django.setup()

from epi.models import EntregaEPI

for entrega in EntregaEPI.objects.all().order_by("id"):
    if not entrega.protocolo:
        protocolo = entrega.montar_protocolo()
        EntregaEPI.objects.filter(pk=entrega.pk).update(protocolo=protocolo)
        print(f"Entrega {entrega.id} -> {protocolo}")

print("Protocolos preenchidos com sucesso.")