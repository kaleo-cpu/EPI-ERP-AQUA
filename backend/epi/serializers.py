from datetime import timedelta  # ✅ necessário no get_validade_ate
from django.utils.crypto import get_random_string  # ✅ senha default
from rest_framework import serializers
from .models import EPI, EstoqueEPI, Funcionario, MatrizFuncaoEPI, EntregaEPI, TrocaEPI, Usuario

class UsuarioSerializer(serializers.ModelSerializer):
    senha = serializers.CharField(write_only=True, required=False, allow_blank=True)
    username = serializers.ReadOnlyField()  # ✅ front não envia username

    class Meta:
        model = Usuario
        fields = ['id','nome','email','perfil','username','senha']

    def create(self, validated):
        pwd = validated.pop('senha', None) or get_random_string(10)
        # Deriva username do e-mail; se não houver, do nome
        email = validated.get('email') or ''
        base_username = (email.split('@')[0] if '@' in email else (validated.get('nome') or 'user')).strip()
        # garante unicidade mínima
        username = base_username or get_random_string(8)
        i = 1
        while Usuario.objects.filter(username=username).exists():
            i += 1
            username = f"{base_username}{i}"

        user = Usuario(username=username, **validated)
        if pwd:
            user.set_password(pwd)
        user.save()
        return user

    def update(self, instance, validated):
        pwd = validated.pop('senha', None)
        for k, v in validated.items():
            setattr(instance, k, v)
        if pwd:
            instance.set_password(pwd)
        instance.save()
        return instance

class EPISerializer(serializers.ModelSerializer):
    class Meta:
        model = EPI
        fields = "__all__"

class EstoqueEPISerializer(serializers.ModelSerializer):
    disponivel = serializers.ReadOnlyField()

    class Meta:
        model = EstoqueEPI
        fields = [
            'id','epi','lote','nf_numero','nf_serie','fornecedor_cnpj',
            'data_compra','quantidade','local_armazenamento','disponivel'
        ]
        read_only_fields = ['id', 'disponivel']

class FuncionarioSerializer(serializers.ModelSerializer):
    class Meta:
        model = Funcionario
        fields = "__all__"

class MatrizFuncaoEPISerializer(serializers.ModelSerializer):
    epi_nome = serializers.CharField(source="epi.nome", read_only=True)
    class Meta:
        model = MatrizFuncaoEPI
        fields = "__all__"

class EntregaEPISerializer(serializers.ModelSerializer):
    class Meta:
        model = EntregaEPI
        fields = "__all__"

class TrocaEPISerializer(serializers.ModelSerializer):
    class Meta:
        model = TrocaEPI
        fields = "__all__"

class EntregaEPIRelatorioSerializer(serializers.ModelSerializer):
    funcionario_nome = serializers.CharField(source="funcionario.nome", read_only=True)
    setor = serializers.CharField(source="funcionario.setor", read_only=True)
    epi_nome = serializers.CharField(source="epi.nome", read_only=True)
    categoria = serializers.CharField(source="epi.categoria", read_only=True)
    validade_ate = serializers.SerializerMethodField()

    class Meta:
        model = EntregaEPI
        fields = [
            "id","funcionario_nome","setor","epi_nome","categoria","lote",
            "quantidade","data_entrega","validade_ate",
        ]

    def get_validade_ate(self, obj):
        if not getattr(obj, "data_entrega", None):
            return None
        dias = getattr(obj.epi, "tempo_validade_dias", None)
        if not dias:
            return None
        try:
            dt = obj.data_entrega.date() if hasattr(obj.data_entrega, "date") else obj.data_entrega
            return (dt + timedelta(days=int(dias))).isoformat()
        except Exception:
            return None
