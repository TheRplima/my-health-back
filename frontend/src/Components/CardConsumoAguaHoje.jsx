import React, { useState } from 'react'
import useUserProfileData from '../App/useUserProfileData'
import useWaterIngestionData from '../App/useWaterIngestionData'
import RegisterWaterIngestionModal from './RegisterWaterIngestionModal';
import { confirm } from "./ConfirmationModal";

import Card from 'react-bootstrap/Card';
import ProgressBar from 'react-bootstrap/ProgressBar'
import { FiTrash } from 'react-icons/fi';
import Button from 'react-bootstrap/esm/Button';
import Spinner from 'react-bootstrap/Spinner';

const CardConsumoAguaHoje = (token) => {
    const [amount, setAmount] = useState(0);
    const { userProfileData } = useUserProfileData()
    const { waterIngestionData, setWaterIngestionData, totalWaterIngestion, deleteWaterIngestion } = useWaterIngestionData()

    const handleRegisterWaterIngestion = async (e) => {
        setWaterIngestionData(amount)
    }

    const handleDeleteButtonClick = (id) => {
        confirm('Deseja realmente excluir este registro?', 'Remover registro', 'Sim', 'Não').then(
            (response) => {
                if (response) {
                    deleteWaterIngestion(id)
                }
            })
    }

    return (
        <>
            <Card className="mb-3">
                <Card.Header className='d-flex'>
                    <Card.Title>Controle de Água</Card.Title>
                    <RegisterWaterIngestionModal handleRegisterWaterIngestion={handleRegisterWaterIngestion} setAmount={setAmount} />
                </Card.Header>
                {(waterIngestionData && Array.isArray(waterIngestionData)) ? (
                    <Card.Body>
                        <Card.Subtitle className="mb-3 text-muted"><strong>Meta diária:</strong> {userProfileData.daily_water_amount} ml</Card.Subtitle>
                        <Card.Subtitle className="mb-3 text-muted"><strong>Total consumido hoje:</strong> {totalWaterIngestion} ml</Card.Subtitle>
                        <ProgressBar animated now={totalWaterIngestion} max={userProfileData.daily_water_amount} label={`${((totalWaterIngestion / userProfileData.daily_water_amount) * 100).toFixed(2)}%`} />
                        <table className="table table-hover">
                            <thead>
                                <tr>
                                    <th scope="col" className='text-center'>Data</th>
                                    <th scope="col" className='text-center'>Quantidade</th>
                                    <th scope="col" className='text-center'>Ações</th>
                                </tr>
                            </thead>
                            <tbody>
                                {waterIngestionData.map((waterIngestion, index) => {
                                    return (
                                        <tr key={index}>
                                            <td className='text-center'>{new Date(waterIngestion.created_at).toLocaleTimeString('pt-BR')}</td>
                                            <td className='text-center'>{waterIngestion.amount} ml</td>
                                            <td className='text-center'>
                                                <Button variant='danger' title={'Remover registro'} onClick={(e) => handleDeleteButtonClick(waterIngestion.id)}><FiTrash /></Button>
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </Card.Body>
                ) : (
                    <Card.Body className='text-center'>
                        <Spinner animation="border" role="status">
                            <span className="sr-only">Loading...</span>
                        </Spinner>
                    </Card.Body>
                )}
            </Card>
        </>
    )
}

export default CardConsumoAguaHoje