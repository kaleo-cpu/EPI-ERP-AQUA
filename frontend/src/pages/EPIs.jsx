import React, { useEffect, useMemo, useState } from "react";
import {
  Dialog, DialogTitle, DialogContent, DialogActions,
  Button, TextField, Table, TableHead, TableRow, TableCell, TableBody,
  IconButton, Stack, Divider
} from "@mui/material";
import EditIcon from "@mui/icons-material/Edit";
import SaveOutlinedIcon from "@mui/icons-material/SaveOutlined";
import CloseOutlinedIcon from "@mui/icons-material/CloseOutlined";

// api = seu client axios já existente no EPIs.jsx

export function LotesDialog({ open, onClose, epi, api }) {
  const [loading, setLoading] = useState(false);
  const [lotes, setLotes] = useState([]);

  // form novo lote
  const [novo, setNovo] = useState({ lote: "", quantidade: "" });

  // edição de lote
  const [editId, setEditId] = useState(null);
  const [edit, setEdit] = useState({ lote: "", quantidade: "" });

  const epiId = epi?.id;

  const loadLotes = async () => {
    if (!epiId) return;
    setLoading(true);
    try {
      // ✅ Mesma rota que você já usa na tela de Entrega:
      const { data } = await api.get(`/epis/${epiId}/lotes/`);
      setLotes(Array.isArray(data) ? data : (data.results || []));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (open) {
      setNovo({ lote: "", quantidade: "" });
      setEditId(null);
      setEdit({ lote: "", quantidade: "" });
      loadLotes();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, epiId]);

  const startEdit = (row) => {
    setEditId(row.id);
    setEdit({
      lote: row.lote ?? "",
      quantidade: row.quantidade ?? ""
    });
  };

  const cancelEdit = () => {
    setEditId(null);
    setEdit({ lote: "", quantidade: "" });
  };

  const salvarEdicao = async () => {
    if (!editId) return;

    // ⚠️ Aqui depende do endpoint do seu backend para editar lote.
    // Eu estou assumindo um padrão REST: PUT /lotes/:id/
    await api.put(`/lotes/${editId}/`, {
      lote: edit.lote,
      quantidade: Number(edit.quantidade),
      epi_id: epiId, // se o backend exigir (mantém compatibilidade)
    });

    cancelEdit();
    await loadLotes();
  };

  const adicionar = async () => {
    if (!novo.lote || !novo.quantidade) return;

    // ⚠️ Aqui depende do endpoint do seu backend para criar lote.
    // Assumindo padrão: POST /lotes/
    await api.post(`/lotes/`, {
      lote: novo.lote,
      quantidade: Number(novo.quantidade),
      epi_id: epiId,
    });

    setNovo({ lote: "", quantidade: "" });
    await loadLotes();
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle sx={{ fontWeight: 900 }}>
        Lotes do EPI: {epi?.nome || ""}
      </DialogTitle>

      <DialogContent dividers>
        {/* Lista */}
        <Table size="small">
          <TableHead>
            <TableRow>
              <TableCell sx={{ fontWeight: 900 }}>Lote</TableCell>
              <TableCell sx={{ fontWeight: 900 }}>Quantidade</TableCell>
              <TableCell sx={{ fontWeight: 900 }} align="right">Ações</TableCell>
            </TableRow>
          </TableHead>

          <TableBody>
            {lotes.map((row) => {
              const isEditing = editId === row.id;

              return (
                <TableRow key={row.id} hover>
                  <TableCell>
                    {isEditing ? (
                      <TextField
                        value={edit.lote}
                        onChange={(e) => setEdit({ ...edit, lote: e.target.value })}
                        size="small"
                        fullWidth
                      />
                    ) : (
                      row.lote || "—"
                    )}
                  </TableCell>

                  <TableCell>
                    {isEditing ? (
                      <TextField
                        type="number"
                        value={edit.quantidade}
                        onChange={(e) => setEdit({ ...edit, quantidade: e.target.value })}
                        size="small"
                        fullWidth
                      />
                    ) : (
                      row.quantidade ?? "—"
                    )}
                  </TableCell>

                  <TableCell align="right">
                    {!isEditing ? (
                      <IconButton onClick={() => startEdit(row)} sx={{ borderRadius: 2 }}>
                        <EditIcon />
                      </IconButton>
                    ) : (
                      <Stack direction="row" spacing={1} justifyContent="flex-end">
                        <Button
                          onClick={cancelEdit}
                          sx={{ borderRadius: 2, textTransform: "none", fontWeight: 800 }}
                        >
                          Cancelar
                        </Button>
                        <Button
                          variant="contained"
                          onClick={salvarEdicao}
                          startIcon={<SaveOutlinedIcon />}
                          sx={{ borderRadius: 2, textTransform: "none", fontWeight: 900 }}
                        >
                          Salvar
                        </Button>
                      </Stack>
                    )}
                  </TableCell>
                </TableRow>
              );
            })}

            {!loading && !lotes.length && (
              <TableRow>
                <TableCell colSpan={3} sx={{ color: "text.secondary", py: 2 }}>
                  Nenhum lote cadastrado para este EPI.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>

        <Divider sx={{ my: 2 }} />

        {/* Novo lote */}
        <Stack direction={{ xs: "column", sm: "row" }} spacing={1.5}>
          <TextField
            label="Novo lote"
            value={novo.lote}
            onChange={(e) => setNovo({ ...novo, lote: e.target.value })}
            size="small"
            fullWidth
          />
          <TextField
            label="Quantidade"
            type="number"
            value={novo.quantidade}
            onChange={(e) => setNovo({ ...novo, quantidade: e.target.value })}
            size="small"
            fullWidth
          />
          <Button
            variant="contained"
            onClick={adicionar}
            sx={{ borderRadius: 2, textTransform: "none", fontWeight: 900, minWidth: 160 }}
          >
            Adicionar lote
          </Button>
        </Stack>
      </DialogContent>

      <DialogActions sx={{ p: 2 }}>
        <Button
          onClick={onClose}
          startIcon={<CloseOutlinedIcon />}
          sx={{ borderRadius: 2, textTransform: "none", fontWeight: 800 }}
        >
          Fechar
        </Button>
      </DialogActions>
    </Dialog>
  );
}