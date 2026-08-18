# Consultas MongoDB Compass — Validación Tasa de Admisión

Colección objetivo: `admissiondatas`

---

## Pestaña FIND (filtros simples)

Estas consultas se pegan directamente en el campo de búsqueda de la pestaña **Documents > Filter**.

---

### F1. Ver todos los registros de un estudiante específico

Reemplaza el valor de `usuario_id` con uno real de tu base de datos.

```json
{ "usuario_id": "25431" }
```

> Verifica que el estudiante tenga exactamente 4 documentos (uno por componente) y que todos tengan el mismo valor en `conCupo`.

---

### F2. Todos los estudiantes admitidos (conCupo = SI)

```json
{ "conCupo": "SI" }
```

---

### F3. Todos los estudiantes NO admitidos (conCupo = NO)

```json
{ "conCupo": "NO" }
```

---

### F4. Registros con conCupo vacío o nulo — detectar datos faltantes

```json
{ "conCupo": { "$in": ["", null] } }
```

> Si devuelve resultados, hay registros sin valor en `conCupo`. Eso afecta el cálculo de la tasa.

---

### F5. Registros de un periodo específico

```json
{ "period": "2025-2" }
```

---

### F6. Registros de una carrera específica

```json
{ "conCupoCarrera": "FCQS-MEDICINA-MATUTINA-PRESENCIAL" }
```

---

### F7. Admitidos en una carrera específica

```json
{ "conCupoCarrera": "FCQS-MEDICINA-MATUTINA-PRESENCIAL", "conCupo": "SI" }
```

---

## Pestaña AGGREGATIONS

Estas consultas se usan en la pestaña **Aggregations** de Compass. Cada etapa (`$group`, `$project`, etc.) se agrega como un stage separado usando el botón **+ Add Stage**.

---

### A1. Distribución de conCupo — cuántos SI vs NO

**Stage 1** — `$group`
```json
{
  "_id": "$conCupo",
  "count": { "$sum": 1 }
}
```

**Stage 2** — `$sort`
```json
{ "count": -1 }
```

> Resultado esperado: dos documentos, uno con `_id: "SI"` y otro con `_id: "NO"`. Si aparece un tercero con `_id: ""` o `_id: null`, hay datos incompletos.

---

### A2. Total de postulantes únicos

**Stage 1** — `$group`
```json
{
  "_id": "$usuario_id"
}
```

**Stage 2** — `$count`
```json
"total_postulantes"
```

---

### A3. Distribución de registros por estudiante — verificar los 4 componentes

**Stage 1** — `$group`
```json
{
  "_id": "$usuario_id",
  "registros": { "$sum": 1 }
}
```

**Stage 2** — `$group`
```json
{
  "_id": "$registros",
  "cantidad_estudiantes": { "$sum": 1 }
}
```

**Stage 3** — `$sort`
```json
{ "_id": 1 }
```

> El resultado ideal es un único documento `{ "_id": 4, "cantidad_estudiantes": N }`. Si hay estudiantes con 1, 2 o 3 registros, sus datos de componentes están incompletos.

---

### A4. Verificar consistencia de conCupo por estudiante

Detecta si un mismo `usuario_id` tiene `SI` en un componente y `NO` en otro (no debería ocurrir).

**Stage 1** — `$group`
```json
{
  "_id": "$usuario_id",
  "valores_conCupo": { "$addToSet": "$conCupo" }
}
```

**Stage 2** — `$match`
```json
{
  "valores_conCupo": { "$size": 2 }
}
```

**Stage 3** — `$count`
```json
"estudiantes_con_conCupo_inconsistente"
```

> Si el resultado es `0` o no devuelve documentos, los datos son consistentes. Cualquier número mayor indica un problema en los datos del Excel original.

---

### A5. Tasa de Admisión por periodo

**Stage 1** — `$group` (deduplicar por estudiante)
```json
{
  "_id": {
    "period": "$period",
    "year": "$year",
    "usuario_id": "$usuario_id"
  },
  "conCupo": { "$first": "$conCupo" }
}
```

**Stage 2** — `$group` (agrupar por periodo)
```json
{
  "_id": {
    "period": "$_id.period",
    "year": "$_id.year"
  },
  "total_postulantes": { "$sum": 1 },
  "total_admitidos": {
    "$sum": {
      "$cond": [{ "$eq": ["$conCupo", "SI"] }, 1, 0]
    }
  }
}
```

**Stage 3** — `$project`
```json
{
  "_id": 0,
  "period": "$_id.period",
  "year": "$_id.year",
  "total_postulantes": 1,
  "total_admitidos": 1,
  "tasa_admision_pct": {
    "$round": [
      {
        "$multiply": [
          { "$divide": ["$total_admitidos", "$total_postulantes"] },
          100
        ]
      },
      2
    ]
  }
}
```

**Stage 4** — `$sort`
```json
{ "year": 1, "period": 1 }
```

---

### A6. Tasa de Admisión por carrera

**Stage 1** — `$group` (deduplicar por estudiante)
```json
{
  "_id": {
    "carrera": "$conCupoCarrera",
    "usuario_id": "$usuario_id"
  },
  "conCupo": { "$first": "$conCupo" }
}
```

**Stage 2** — `$group` (agrupar por carrera)
```json
{
  "_id": "$_id.carrera",
  "total_postulantes": { "$sum": 1 },
  "total_admitidos": {
    "$sum": {
      "$cond": [{ "$eq": ["$conCupo", "SI"] }, 1, 0]
    }
  }
}
```

**Stage 3** — `$project`
```json
{
  "_id": 0,
  "carrera": "$_id",
  "total_postulantes": 1,
  "total_admitidos": 1,
  "tasa_admision_pct": {
    "$round": [
      {
        "$multiply": [
          { "$divide": ["$total_admitidos", "$total_postulantes"] },
          100
        ]
      },
      2
    ]
  }
}
```

**Stage 4** — `$sort`
```json
{ "tasa_admision_pct": -1 }
```

---

### A7. Tasa de Admisión por carrera y periodo (combinado)

**Stage 1** — `$group` (deduplicar por estudiante)
```json
{
  "_id": {
    "carrera": "$conCupoCarrera",
    "period": "$period",
    "year": "$year",
    "usuario_id": "$usuario_id"
  },
  "conCupo": { "$first": "$conCupo" }
}
```

**Stage 2** — `$group`
```json
{
  "_id": {
    "carrera": "$_id.carrera",
    "period": "$_id.period",
    "year": "$_id.year"
  },
  "total_postulantes": { "$sum": 1 },
  "total_admitidos": {
    "$sum": {
      "$cond": [{ "$eq": ["$conCupo", "SI"] }, 1, 0]
    }
  }
}
```

**Stage 3** — `$project`
```json
{
  "_id": 0,
  "carrera": "$_id.carrera",
  "period": "$_id.period",
  "year": "$_id.year",
  "total_postulantes": 1,
  "total_admitidos": 1,
  "tasa_admision_pct": {
    "$round": [
      {
        "$multiply": [
          { "$divide": ["$total_admitidos", "$total_postulantes"] },
          100
        ]
      },
      2
    ]
  }
}
```

**Stage 4** — `$sort`
```json
{ "year": 1, "period": 1, "tasa_admision_pct": -1 }
```

---

## Orden de ejecución recomendado

| # | Consulta | Propósito |
|---|---|---|
| 1 | F4 | Detectar si hay registros con `conCupo` vacío |
| 2 | A4 | Verificar consistencia del campo `conCupo` por estudiante |
| 3 | A3 | Confirmar que todos los estudiantes tienen 4 componentes |
| 4 | A1 | Ver cuántos SI vs NO en total |
| 5 | A5 | Calcular la Tasa de Admisión por periodo |
| 6 | A6 | Calcular la Tasa de Admisión por carrera |
