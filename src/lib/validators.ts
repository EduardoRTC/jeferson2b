import { z } from 'zod';

export const userSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
  name: z.string().min(2),
  role: z.enum(['admin', 'user']).default('user'),
});

export const productSchema = z.object({
  nome: z.string().min(2),
  descricao: z.string().optional(),
  preco: z.number().positive(),
  quantidade: z.number().int().min(0),
  imagem: z.string().url().optional(),
});

export const supplierSchema = z.object({
  name: z.string().min(2),
  cnpj: z.string().regex(/^\d{14}$/),
  email: z.string().email(),
  phone: z.string().min(10),
  address: z.string().min(5),
});

export const customerSchema = z.object({
  name: z.string().min(2),
  document: z.string().regex(/^(\d{11}|\d{14})$/),
  email: z.string().email(),
  phone: z.string().min(10),
  address: z.string().min(5),
  type: z.enum(['individual', 'company']),
});

export const orderSchema = z.object({
  customerId: z.string(),
  items: z.array(
    z.object({
      productId: z.string(),
      quantity: z.number().int().positive(),
      price: z.number().positive(),
    })
  ),
});

export const transactionSchema = z.object({
  data: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/, 'Data deve estar no formato YYYY-MM-DD')
    .nonempty('A data é obrigatória'),
  tipo: z.enum(['Entrada', 'Saída'], 'Tipo deve ser Entrada ou Saída'),
  valor: z.number().positive('O valor deve ser maior que 0'),
  produtoId: z.number().int().positive('O ID do produto deve ser um número inteiro positivo'),
  pedidoId: z.number().int().nullable().optional(),
});