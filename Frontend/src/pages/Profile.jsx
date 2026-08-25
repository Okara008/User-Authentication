import { useNavigate, Link } from "react-router"
import { useEffect, useLayoutEffect, useState } from "react"

const Profile = () =>{
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
		retrievedProfilePic: ''
	})

	const handleSubmit = async(e) => {
		e.preventDefault()
		
		const data = new FormData();
		data.append("full_name", formData.fullname);
		data.append("date_of_birth", formData.dob);
		data.append("username", formData.username);
		data.append("email", formData.email);
		data.append("profile_pic", formData.profilePic);
		for (const pair of data.entries()) {
			console.log(pair[0], pair[1])
		}
		try{
			const response = await fetch(`${baseUrl}/profile`, {
				method: 'POST',
				body: data,
				credentials: 'include'
			})
			console.log(response);
			const respData = await response.json()
			if(!response.ok){
				throw respData.message
			}
			// setFormData(prev => ({...prev, retrievedProfilePic: respData.profile_pic}))
		}catch(error){
			if(typeof error === "string"){
				setErrorMessage(error)
			}else{
				setErrorMessage("Network error. Please check your connection.");
			}
	}
	}

	useEffect(() => {
		const fetchData = async() =>{
			try{
				const response = await fetch(`${baseUrl}?user=user`, {
					method: 'GET',
					headers: {
						'Content-Type' :'application/json'
					},
					credentials: "include"
				})
				const data = await response.json()
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
		
		fetchData()
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

    const styles = {
        moveRight: {
            marginRight: 10
        }
    }

    return(<>
	{ displayContent && (
		<div>
			<h1>User:  {formData.username}</h1> 
			<form method="post" onSubmit={handleSubmit}>
				<fieldset>
					<legend><b>Personal Info</b></legend>
					<label htmlFor="fullname" style={styles.moveRight}>Full Name</label>
					<input value={formData.fullname} onChange={(e) => setFormData(prev => ({...prev, fullname: e.target.value}))} type="text" name="fullname" placeholder="John Doe"/><br /><br />
					
					<label htmlFor="email" style={styles.moveRight}>Email</label>
					<input value={formData.email} onChange={(e) => setFormData(prev => ({...prev, email: e.target.value}))} type="text" name="email" placeholder="JohnDoe123"/><br /><br />

					<label htmlFor="dob" style={styles.moveRight}>Date Of Birth</label>
					<input value={formData.dob} onChange={(e) => setFormData(prev => ({...prev, dob: e.target.value}))} type="date" name="dob" /><br /><br />

					<small style={{color: 'red'}}>{errorMessage}</small><br /><br />

					<label htmlFor="profilePic" style={styles.moveRight}>Profile Picture</label>
					<input onChange={(e) => setFormData(prev => ({...prev, profilePic: e.target.files[0]}))} type="file" name="profile_pic" id="profilePic" accept="image/*"/><br /><br />
					
					<button type="submit" name="submit" style={styles.moveRight}>Submit</button>
				</fieldset>
			</form>

			{formData.retrievedProfilePic &&(
				<img width={200} src={formData.retrievedProfilePic} alt="Profile" />
			)}
			<button onClick={handleLogout}>Logout</button>
		</div>
	)}
	{!displayContent && ( <>{errorMessage}  <Link to='/login'>Log in</Link></>)}
    </>)
}
export default Profile