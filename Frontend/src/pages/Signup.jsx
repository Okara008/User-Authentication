import { useState } from "react"
import { Link } from "react-router"
import { useNavigate } from "react-router";

const Signup = () =>{
    const [errorMessage, setErrorMessage] = useState("")
    const navigate = useNavigate()
    const [formData, setFormData] = useState({
        email: '',
        username: '',
        role: 'user',
        password: ''
    })
    const baseUrl = 'https://user-authentication-7r0b.onrender.com'

    const handleSubmit = async(e)=>{
        e.preventDefault()

        try{
            console.log(formData);
            const response = await fetch(`${baseUrl}/signup`, {
                method: "POST",
                headers:{
                    "Content-Type": "application/json"
                },
                credentials: 'include',
                body: JSON.stringify(formData)
            })
            const data = await response.json()
            if(!response.ok){
                throw data.message
            }
            if (response.ok) {
                if(data.isAdmin){
                    navigate("/admin")
                }
                else{
                    navigate("/profile");

                }
            }
        }catch(error){
            if(typeof error === "string"){
                setErrorMessage(error)
            }else{
                setErrorMessage("Network error. Please check your connection.");
            }
    }
    }


    const styles = {
        moveRight: {
            marginRight: 10
        }
    }
    return(
		<form method="post" onSubmit={handleSubmit}>
			<fieldset>
				<legend>Sign Up</legend>
				<label htmlFor="email" style={styles.moveRight}>Email</label>
				<input type="email" id="email" onChange={(e)=> setFormData({...formData, email: e.target.value})} placeholder="johndoe123@gmail.com" name="email"/><br /><br />
				
				<label htmlFor="username" style={styles.moveRight}>Username</label>
				<input type="text" id="username" onChange={(e)=> setFormData({...formData, username: e.target.value})} placeholder="johndoe123" name="username"/><br /><br />
				
                <label  htmlFor="role" style={styles.moveRight}>Role</label>
				<select name="role" id="role" value={formData.role} onChange={(e) => setFormData(prev => ({...prev, role: e.target.value}))}>
                    <option value="User" >User</option>
                    <option value="Admin" >Admin</option>
                </select><br /><br />

				<label htmlFor="password" style={styles.moveRight}>Password</label>
				<input type="password" id="password" onChange={(e)=> setFormData({...formData, password: e.target.value})} placeholder="password123"  name="password"/><br /><br />

                <small style={{color: 'red'}}>{errorMessage}</small><br /><br />
                
                <button type="submit" name="submit" style={styles.moveRight}>Submit</button>
                <Link to='/login'>Log in instead</Link><br /><br />
                
                <button type="button">Log in with google instead</button>
			</fieldset>
		</form>
    )
}
export default Signup