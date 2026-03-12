import os
import sqlite3

os.environ.setdefault("DJANGO_SETTINGS_MODULE", "epi_manager.settings")

from django.conf import settings
import django

django.setup()

db_path = settings.DATABASES["default"]["NAME"]
print(f"Banco: {db_path}")

conn = sqlite3.connect(db_path)
cursor = conn.cursor()

cursor.execute("PRAGMA table_info(epi_entregaepi)")
cols = [row[1] for row in cursor.fetchall()]
print("Colunas atuais:", cols)

if "protocolo" not in cols:
    cursor.execute("ALTER TABLE epi_entregaepi ADD COLUMN protocolo varchar(20)")
    conn.commit()
    print("Coluna 'protocolo' criada com sucesso.")
else:
    print("Coluna 'protocolo' já existe.")

conn.close()
print("Finalizado.")