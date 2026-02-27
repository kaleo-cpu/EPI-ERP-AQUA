from django.db import models, transaction
from django.conf import settings
from django.core.exceptions import ValidationError
from django.contrib.auth.models import AbstractUser, Group, Permission

class Usuario(AbstractUser):
    nome = models.CharField(max_length=150)
    perfil = models.CharField(
        max_length=20,
        choices=[('admin','Administrador'),('gestor','Gestor'),('colaborador','Colaborador')]
    )

    # 🔧 Sobrescreve os M2M para evitar choque com auth.User
    groups = models.ManyToManyField(
        Group,
        verbose_name='groups',
        blank=True,
        related_name='epi_users',              # <= evita o 'user_set' padrão
        related_query_name='epi_user',
        help_text=(
            'The groups this user belongs to. A user will get all permissions '
            'granted to each of their groups.'
        ),
    )
    user_permissions = models.ManyToManyField(
        Permission,
        verbose_name='user permissions',
        blank=True,
        related_name='epi_users_permissions',  # <= evita o 'user_set' padrão
        related_query_name='epi_user',
        help_text='Specific permissions for this user.',
    )

    def __str__(self):
        return self.nome or self.username

class EPI(models.Model):
    CATEGORIAS = [
        ("calçado", "Calçado"),
        ("ocular", "Proteção Ocular"),
        ("respiratória", "Proteção Respiratória"),
        ("auditiva", "Proteção Auditiva"),
        ("cabeça", "Cabeça"),
        ("mãos", "Mãos"),
        ("corpo", "Corpo"),
        ("outros", "Outros"),
    ]
    nome = models.CharField(max_length=120)
    categoria = models.CharField(max_length=20, choices=CATEGORIAS, default="outros")
    tempo_validade_dias = models.PositiveIntegerField(default=180)
    numero_ca = models.CharField(max_length=50)
    validade_ca = models.DateField(null=True, blank=True)
    fabricante = models.CharField(max_length=120, blank=True)
    modelo = models.CharField(max_length=120, blank=True)
    unidade = models.CharField(max_length=10, default="un")
    alerta_estoque_min = models.PositiveIntegerField(default=0)
    observacoes = models.TextField(blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    def __str__(self):
        return self.nome

class EstoqueEPI(models.Model):
    epi = models.ForeignKey(EPI, on_delete=models.CASCADE, related_name="estoques")
    lote = models.CharField(max_length=60, blank=True)
    nf_numero = models.CharField(max_length=30, blank=True)
    nf_serie = models.CharField(max_length=10, blank=True)
    fornecedor_cnpj = models.CharField(max_length=20, blank=True)
    data_compra = models.DateField()
    quantidade = models.IntegerField()
    local_armazenamento = models.CharField(max_length=120, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        indexes = [models.Index(fields=["epi", "lote"])]

    @property
    def disponivel(self):
        return self.quantidade

    def debitar(self, quantidade):
        if quantidade <= 0:
            raise ValidationError("Quantidade inválida para baixa.")
        if self.quantidade < quantidade:
            raise ValidationError("Estoque insuficiente no lote.")
        self.quantidade -= quantidade
        self.save(update_fields=["quantidade"])

class Funcionario(models.Model):
    STATUS = [("ativo","Ativo"), ("inativo","Inativo")]
    nome = models.CharField(max_length=140)
    cpf = models.CharField(max_length=14, unique=True)
    data_nascimento = models.DateField(null=True, blank=True)
    nome_pai = models.CharField(max_length=140, blank=True)
    nome_mae = models.CharField(max_length=140, blank=True)
    endereco = models.TextField(blank=True)
    telefone = models.CharField(max_length=40, blank=True)
    email = models.EmailField(blank=True)
    cbo = models.CharField(max_length=20)
    funcao = models.CharField(max_length=100)
    setor = models.CharField(max_length=100)
    data_admissao = models.DateField()
    pis = models.CharField(max_length=20, blank=True)
    ctps_numero = models.CharField(max_length=20, blank=True)
    ctps_serie = models.CharField(max_length=20, blank=True)
    status = models.CharField(max_length=10, choices=STATUS, default="ativo")
    biometria_template_hash = models.CharField(max_length=256, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    def __str__(self):
        return f"{self.nome} ({self.cpf})"

class MatrizFuncaoEPI(models.Model):
    funcao = models.CharField(max_length=100)
    cbo = models.CharField(max_length=20, blank=True)
    setor = models.CharField(max_length=100, blank=True)
    epi = models.ForeignKey(EPI, on_delete=models.CASCADE)
    quantidade_padrao = models.PositiveIntegerField(default=1)
    obrigatorio = models.BooleanField(default=True)
    class Meta:
        indexes = [models.Index(fields=["funcao", "setor", "cbo"])]

class EntregaEPI(models.Model):
    funcionario = models.ForeignKey(Funcionario, on_delete=models.CASCADE, related_name="entregas")
    epi = models.ForeignKey(EPI, on_delete=models.PROTECT)
    lote = models.CharField(max_length=60, blank=True)
    quantidade = models.PositiveIntegerField(default=1)
    data_entrega = models.DateTimeField(auto_now_add=True)
    data_validade_prevista = models.DateField()
    verif_facial_score = models.FloatField(null=True, blank=True)
    verif_dispositivo_info = models.JSONField(default=dict, blank=True)
    ip = models.GenericIPAddressField(null=True, blank=True)
    geo = models.CharField(max_length=120, blank=True)
    responsavel = models.ForeignKey(
        settings.AUTH_USER_MODEL,  # ✅ mais seguro p/ custom user
        on_delete=models.SET_NULL, null=True, blank=True
    )
    termo_pdf_id = models.CharField(max_length=120, blank=True)
    hash_termo = models.CharField(max_length=120, blank=True)

class TrocaEPI(models.Model):
    MOTIVOS = [("vencimento","Vencimento"), ("dano","Dano"), ("perda","Perda"),
               ("extravio","Extravio"), ("ajuste","Ajuste de tamanho")]
    entrega = models.ForeignKey(EntregaEPI, on_delete=models.CASCADE, related_name="trocas")
    motivo = models.CharField(max_length=20, choices=MOTIVOS)
    aprovado_por = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.SET_NULL, null=True, blank=True)
    data_solicitacao = models.DateTimeField(auto_now_add=True)
    data_aprovacao = models.DateTimeField(null=True, blank=True)
    nova_entrega = models.ForeignKey(EntregaEPI, on_delete=models.SET_NULL, null=True, blank=True, related_name="+")

class AuditLog(models.Model):
    usuario = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.SET_NULL, null=True, blank=True)
    acao = models.CharField(max_length=80)
    recurso = models.CharField(max_length=80)
    recurso_id = models.CharField(max_length=80, blank=True)
    before_json = models.JSONField(default=dict, blank=True)
    after_json = models.JSONField(default=dict, blank=True)
    timestamp = models.DateTimeField(auto_now_add=True)
    ip = models.CharField(max_length=64, blank=True)
    user_agent = models.CharField(max_length=200, blank=True)
    assinatura_hash = models.CharField(max_length=120, blank=True)
