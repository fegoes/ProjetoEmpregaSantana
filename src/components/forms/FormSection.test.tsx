import { useState } from 'react'
import { cleanup, fireEvent, render, screen, waitFor } from '@testing-library/react'
import { afterEach, expect, it, vi } from 'vitest'
import { FormSection } from './FormSection'
import { FieldDialog } from './FieldDialog'
afterEach(cleanup)
it('revela campo obrigatório inválido em uma seção recolhida', async () => {
 render(<form><FormSection title="Dados adicionais"><label>Documento<input required aria-label="Documento" /></label></FormSection></form>)
 const input=screen.getByLabelText('Documento')
 expect(input.closest('details')).not.toHaveAttribute('open')
 fireEvent.invalid(input)
 expect(input.closest('details')).toHaveAttribute('open')
 expect(screen.getByRole('alert')).toHaveTextContent('Preencha ou corrija')
 await waitFor(()=>expect(input).toHaveFocus())
})
it('fechar e reabrir o modal preserva os dados e não submete o formulário externo', () => {
 const submit=vi.fn()
 function Demo(){const [value,setValue]=useState('');return <form onSubmit={submit}><FieldDialog label="Resumo" kind="text"><input aria-label="Resumo profissional" value={value} onChange={event=>setValue(event.target.value)}/></FieldDialog></form>}
 render(<Demo/>)
 fireEvent.click(screen.getByRole('button',{name:'Editar Resumo'}))
 fireEvent.change(screen.getByRole('textbox',{name:'Resumo profissional'}),{target:{value:'Experiência em vendas'}})
 fireEvent.click(screen.getByRole('button',{name:'Concluir'}))
 fireEvent.click(screen.getByRole('button',{name:'Editar Resumo'}))
 expect(screen.getByRole('textbox',{name:'Resumo profissional'})).toHaveValue('Experiência em vendas')
 expect(submit).not.toHaveBeenCalled()
})
