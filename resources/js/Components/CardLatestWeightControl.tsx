import React from 'react'

import { router } from '@inertiajs/react'

import PrimaryButton from '../Components/PrimaryButton';
import { FiTrash } from 'react-icons/fi';
import Card from 'react-bootstrap/Card';

interface User {
    id: number;
    name: string;
    email: string;
    weight: number;
    height: number;
    birth_date: string;
    daily_water_amount: number;
    email_verified_at: string;
}

export interface WeightControl {
    id: number;
    weight: number;
    user_id: number;
    created_at: string;
    updated_at: string;
}

interface PageProps {
    user: User;
    weightControls: WeightControl[];
}

const CardLatestWeightControl: React.FC<PageProps> = ({ user, weightControls }) => {
    function deleteWeightControl(id: number) {
        router.delete(`/weight-control/${id}`);
    }

    return (
        <Card className="mb-3 w-100">
            <Card.Header className='d-flex'>
                <Card.Title>Controle de Peso</Card.Title>
            </Card.Header>
            <Card.Body>
                <Card.Subtitle className="mb-3 text-muted"><strong>Peso atual:</strong> {user.weight}Kg</Card.Subtitle>
                <Card.Subtitle className="mb-3 text-muted"><strong>Últimos 5 registros</strong></Card.Subtitle>
                <table className="table table-hover">
                    <thead>
                        <tr>
                            <th scope="col" className='text-center'>Data</th>
                            <th scope="col" className='text-center'>Peso</th>
                            <th scope="col" className='text-center'>Ações</th>
                        </tr>
                    </thead>
                    <tbody>
                        {weightControls && weightControls.length > 0 ? (
                            weightControls && weightControls.map((weightControl, index) => (
                                <tr key={index}>
                                    <td className='text-center'>{new Date(weightControl.created_at).toLocaleDateString('pt-BR')}</td>
                                    <td className='text-center'>{weightControl.weight}kg</td>
                                    <td className='text-center'>
                                        <PrimaryButton onClick={
                                            () => {
                                                if (confirm('Tem certeza que deseja excluir este registro?')) {
                                                    deleteWeightControl(weightControl.id);
                                                }
                                            }
                                        }><FiTrash /></PrimaryButton>
                                    </td>
                                </tr>
                            ))
                        ) : (
                            <tr>
                                <td></td>
                                <td className='nodata text-center d-flex align-items-center justify-content-center'>
                                    Nenhum registro encontrado
                                </td>
                                <td></td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </Card.Body>
        </Card>
    )
}

export default CardLatestWeightControl
