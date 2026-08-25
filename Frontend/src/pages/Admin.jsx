import { useNavigate, Link } from "react-router"
import { useState, useEffect } from "react"
const Admin = ()=>{
	const navigate = useNavigate()
	const [errorMessage, setErrorMessage] = useState("")
	const [displayContent, setDisplayContent] = useState(true)

	const baseUrl = 'https://user-authentication-7r0b.onrender.com'

	const [formData, setFormData] = useState({
		fullname: '',
		username: '',
		dob: '',
		email: '',
		profilePic: '',
		retrievedProfilePic: '',
        role: ''
	})
    const [users, setUsers] = useState([])

	const data = new FormData();

	const handleSubmit = async(e) => {
		e.preventDefault()
		
		try{
			data.append("full_name", formData.fullname);
			data.append("date_of_birth", formData.dob);
			data.append("username", formData.username);
			data.append("email", formData.email);
			data.append("profile_pic", formData.profilePic);
			
			const response = await fetch(`${baseUrl}/profile`, {
				method: 'POST',
				body: data,
				credentials: 'include'
			})
			const respData = await response.json()
			setFormData(prev => ({...prev, retrievedProfilePic: respData.profile_pic}))
		}catch(error){
			setErrorMessage("Network error. Please check your connection.");
		}
	}

	useEffect(() => {
		const fetchData = async() =>{
			try{
				const response = await fetch(`${baseUrl}/admin?user=admin`, {
					method: 'GET',
					headers: {
						'Content-Type' :'application/json'
					},
					credentials: "include"
				})
				let data = await response.json()
				
				if(!response.ok){
					setDisplayContent(false)
					throw data.message
				}
				let [row] = data
				setFormData(prev => ({
					...prev, 
					dob: row.date_of_birth ? row.date_of_birth.slice(0, 10) : "",
					username: row.username ?? "",
					fullname: row.full_name ?? "",
					retrievedProfilePic: row.profile_pic_url ?? "",
					email: row.email ?? ""
				}))

			}catch(error){
				if(typeof error === "string"){
					setErrorMessage(error)
				}else{
					setErrorMessage("Network error. Please check your connection.");
				}
			}
		}
		const fetchUsers = async() => {
			const response = await fetch(`${baseUrl}/admin?user=users`, {
				method: "GET",
				headers: {
					'Content-Type': 'application/json'
				},
				credentials: 'include'
			})

			const data = await response.json()
			setUsers(data)
		}

		fetchData()
		fetchUsers()
	}, [])

	const handleLogout = async()=>{
		try{
			const response = await fetch(`${baseUrl}/logout`, {
				method: "DELETE",
				credentials: 'include'
			})
			const data = await response.json()
			if(response.ok){
				navigate('/login')
			}else{
				throw data.message
			}
		}catch(error){
			if(typeof error === "string"){
				setErrorMessage(error)
			}
			else{
				setErrorMessage("Network error. Please check your connection.")
			}
		}
	}

    const deleteUser = async (id)=>{
        try{
            const response = await fetch(`${baseUrl}?id=${id}`, {
                method: "DELETE",
                headers:{
                    "Content-Type": "application/json"
                },
				credentials: 'include'
            })
            const data = await response.text()
            setUsers(prev => {
                let copy = [...prev]
                copy = copy.filter(user => (user.id != id))
                return copy
            })
        }catch(error){
            setErrorMessage("Network error. Please check your connection.");
        }
    }

	const viewUser = async(id) => {
		try{

			const response = await fetch(`${baseUrl}/admin?id=${id}`, {
				method: 'GET',
				headers: {
					'Content-Type': 'application/json'
				},
				credentials: 'include'
			})

			const data = await response.json()
			console.log(data);
        }catch(error){
            setErrorMessage("Network error. Please check your connection.");
        }
	}

    const styles = {
        moveRight: {
            marginRight: 10
        },
        tableData: {
            padding: 10,
            border: '1px solid black'
        }
    }

    return(<>
	{ displayContent && (
		<div>
			<h1>Admin:  {formData.username}</h1> 
			<form method="post" onSubmit={handleSubmit}>
				<fieldset>
					<legend><b>Personal Info</b></legend>

					<label htmlFor="fullname" style={styles.moveRight}>Full Name</label>
					<input value={formData.fullname} onChange={(e) => setFormData(prev => ({...prev, fullname: e.target.value}))} type="text" name="fullname" placeholder="John Doe"/><br /><br />
					
					<label htmlFor="email" style={styles.moveRight}>Email</label>
					<input value={formData.email} onChange={(e) => setFormData(prev => ({...prev, email: e.target.value}))} type="text" name="email" placeholder="JohnDoe123"/><br /><br />

					<label htmlFor="dob" style={styles.moveRight}>Date Of Birth</label>
					<input value={formData.dob} onChange={(e) => setFormData(prev => ({...prev, dob: e.target.value}))} type="date" name="dob" /><br /><br />

					<label htmlFor="profilePic" style={styles.moveRight}>Profile Picture</label>
					<input onChange={(e) => setFormData(prev => ({...prev, profilePic: e.target.files[0]}))} type="file" name="profile_pic" id="profilePic" accept="image/*"/><br /><br />

					<small style={{color: 'red'}}>{errorMessage}</small><br /><br />
					<button type="submit" name="submit" style={styles.moveRight}>Submit</button>
				</fieldset>
			</form>

			{formData.retrievedProfilePic &&(
				<img width={200} src={formData.retrievedProfilePic} alt="Profile" />
			)}

			<button onClick={handleLogout}>Logout</button><br /><br />
			
			{users.length > 0 &&
				(<table style={{borderCollapse: 'collapse', marginInline: 'auto'}}>
					<thead>
						<tr >
							<th style={styles.tableData}>username</th>
							<th style={styles.tableData}>role</th>
							<th style={styles.tableData}>email</th>
							<th style={styles.tableData}>Action</th>
							<th style={styles.tableData}>View</th>
						</tr>
					</thead>

					<tbody>
						{users.length !== 0 && (
							users.map(user => 
								<tr key={user.id} >
								<td style={styles.tableData}>{user.username ?? "-"}</td>
								<td style={styles.tableData}>{user.role ?? "-"}</td>
								<td style={styles.tableData}>{user.email ?? "-"}</td>
								<td style={styles.tableData}><button onClick={() => deleteUser(user.id)}>Delete</button></td>
								<td style={styles.tableData}><button onClick={() => viewUser(user.id)}>View</button></td>
							</tr>
							)
						)}
					</tbody>
				</table>)
			}
			
		</div>
		)}
		{!displayContent && ( <>{errorMessage}  <Link to='/login'>Log in</Link></>)}

    </>)
}

export default Admin