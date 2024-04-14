import React, { useState } from 'react'
import useUserProfileData from '../App/useUserProfileData'
import useWeightControlData from '../App/useWeightControlData'
import RegisterWeightControlModal from './RegisterWeightControlModal';
import useToken from '../App/useToken';

import Card from 'react-bootstrap/Card';
import { FiTrash } from 'react-icons/fi';
import Button from 'react-bootstrap/esm/Button';
import Spinner from 'react-bootstrap/Spinner';

async function RegisterWeightControl(weight, token) {
    return fetch('http://localhost:8000/api/weight-control', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json',
            'Authorization': 'Bearer ' + token,
        },
        body: JSON.stringify({ weight })
    }).then(data => data.json()).catch((error) => {
        console.log('Error', error.message);
    });
}

const CardControlePeso = () => {
    const { userProfileData, refreshUserData } = useUserProfileData()
    const [weight, setWeight] = useState(userProfileData.weight);
    const { weightControlData, setWeightControlData } = useWeightControlData()
    const {getToken} = useToken()

    const handleRegisterWeightControl = async (e) => {
        const token = getToken()
        RegisterWeightControl(weight, token).then(data => {
            setWeightControlData(data.weight_control)
            refreshUserData();
        }).catch((error) => {
            console.log('Error', error.message);
        });
    }

    return (
        <>
            <Card className="mb-3">
                <Card.Header className='d-flex'>
                    <Card.Title>Controle de Peso</Card.Title>
                    <RegisterWeightControlModal handleRegisterWeightControl={handleRegisterWeightControl} setWeight={setWeight} />
                </Card.Header>
                {(weightControlData && Array.isArray(weightControlData)) ? (
                    <Card.Body>
                        <Card.Subtitle className="mb-3 text-muted"><strong>Peso atual:</strong> {weight}  Kg</Card.Subtitle>                        
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
                                {weightControlData.map((weightControl, index) => {
                                    return (
                                        <tr key={index}>
                                            <td className='text-center'>{new Date(weightControl.created_at).toLocaleDateString('pt-BR')}</td>
                                            <td className='text-center'>{weightControl.weight} Kg</td>
                                            <td className='text-center'>
                                                <Button variant='danger' title={'Remover registro'}><FiTrash /></Button>
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

export default CardControlePeso