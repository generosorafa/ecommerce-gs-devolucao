# Código de Devolução GS

Site estático simples para exibir e copiar o código de devolução do dia.

## Atualizar o código

Edite `codigo.json`:

```json
{
  "codigo": "CODIGO_DO_DIA",
  "atualizadoEm": "2026-06-02"
}
```

Quando o campo `codigo` estiver vazio, o botão de copiar fica desativado.

## Admin

Acesse `admin.html` ou abra o site com `?admin=true`.

O admin precisa de um token GitHub com permissão de leitura e escrita em
`Contents` neste repositório. O token não fica salvo no código do site; quando
marcado, ele fica apenas no navegador usado para atualizar o código.
