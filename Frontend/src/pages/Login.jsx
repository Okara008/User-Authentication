import { Link } from "react-router"
import { useState } from "react"
import { useNavigate } from "react-router";

const Login = () =>{
    const navigate = useNavigate();
    const [formData, setFormData] = useState({
        // username: '',
        // password: ''
        username: 'vohugyvini',
        password: 'Pa$$w0rd!'
    })
    const [errorMessage, setErrorMessage] = useState("")
    const baseUrl = 'http://localhost:5000'

    const handleSubmit = async (e) => {
        e.preventDefault()
        try{
            const response = await fetch(`${baseUrl}/login`, {
                method: 'POST',
                headers: {
                    "Content-Type": "application/json" 
                },
                credentials: "include",
                body: JSON.stringify(formData)
            })

            const data = await response.json()
            if(!response.ok){
                throw data.message
            }

            if(data.isAdmin){
                navigate("/admin");
            }
            else{
                navigate("/profile");
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
				<legend>Login</legend>
				<label htmlFor="username" style={styles.moveRight}>Username</label>
				<input type="text" onChange={(e)=> setFormData({...formData, username: e.target.value})}  placeholder="JohnDoe123" name="username"/><br /><br />
				
				<label htmlFor="password" style={styles.moveRight}>Password</label>
				<input type="password" onChange={(e)=> setFormData({...formData, password: e.target.value})} placeholder="password123"  name="password"/><br /><br />
                <small style={{color: 'red'}}>{errorMessage}</small><br /><br />
                
                <button type="submit" name="submit" style={styles.moveRight}>Submit</button>
                <Link to='/'>Sign up instead</Link><br /><br />

                <button type="button">Log in with google instead</button>
			</fieldset>
		</form>
    )
}
export default Login