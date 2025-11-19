import type { FC } from 'react'
import type { AxiosResponse } from '~/axios'
import type ApplicationDto from '@/interfaces/ApplicationDto'
import { useEffect, useState } from 'react'
import { Table, Modal, Button } from 'react-bootstrap'
import apiService from '@/service/api-service'

type ModalProps = {
  show: boolean
  onHide: () => void
  user?: ApplicationDto
}

const ModalComponent: FC<ModalProps> = ({ show, onHide, user }) => {
  return (
    <Modal
      show={show}
      onHide={onHide}
      size="lg"
      aria-labelledby="contained-modal-title-vcenter"
      centered
    >
      <Modal.Header closeButton>
        <Modal.Title id="contained-modal-title-vcenter">
          Row Details
        </Modal.Title>
      </Modal.Header>
      <Modal.Body>{JSON.stringify(user)}</Modal.Body>
      <Modal.Footer>
        <Button onClick={onHide}>Close</Button>
      </Modal.Footer>
    </Modal>
  )
}

const Dashboard: FC = () => {
  const [data, setData] = useState<any>([])
  const [selectedUser, setSelectedUser] = useState<ApplicationDto | undefined>(
    undefined,
  )

  useEffect(() => {
    apiService
      .getAxiosInstance()
      .get('/v1/applications')
      .then((response: AxiosResponse) => {
        const applications: ApplicationDto[] = []
        for (const application of response.data) {
          const applicationDto = {
            id: application.id,
            username: application.username,
            email: application.email,
          }
          applications.push(applicationDto)
        }
        setData(applications)
      })
      .catch((error) => {
        console.error(error)
      })
  }, [])

  const handleClose = () => {
    setSelectedUser(undefined)
  }

  return (
    <div className="min-vh-45 mh-45 mw-50 ml-4">
      <Table striped bordered hover>
        <thead>
          <tr>
            <th>Application ID</th>
            <th>User Name</th>
            <th>Email</th>
            <th />
          </tr>
        </thead>
        <tbody>
          {data.map((application: ApplicationDto) => (
            <tr key={application.id}>
              <td>{application.id}</td>
              <td>{application.username}</td>
              <td>{application.email}</td>
              <td className="text-center">
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={() => setSelectedUser(application)}
                >
                  View Details
                </Button>
              </td>
            </tr>
          ))}
        </tbody>
      </Table>
      <ModalComponent
        show={!!selectedUser}
        onHide={handleClose}
        user={selectedUser}
      />
    </div>
  )
}

export default Dashboard
