const fields = 
{
	nombre: { maxLength: 50, onlyLetters: true },
	apellidoPaterno: { maxLength: 50, onlyLetters: true },
	apellidoMaterno: { maxLength: 50, onlyLetters: true },
	email: { maxLength: 60 },
	password: { maxLength: 30 },
	marca: { maxLength: 60, onlyLetters: false },
	precio: { maxLength: 7, integer: false, maxSize: 1000, minSize: 0},
	cantidad: { maxLength: 3, integer: true, maxSize: 500, minSize: 1 },
	descripcion: { maxLength: 120, onlyLetters: false },
	titulo: { maxLength: 128, onlyLetters: false },
}


function validateNames(event, inputElement = null)
{
	let input = inputElement === null ? event.target : inputElement;
	let value = input.value;
	let isValid = false;
	
	const message = document.getElementById('message-' + input.name);

	console.log(value);

	console.log(value.length);

	if(value.length === 0) 
	{
		isValid = false;
	} 
	else 
	{
		// Segunda validacion, si input es mayor que 35
		if(fields.hasOwnProperty(input.name) && fields[input.name].hasOwnProperty('maxLength'))
		{
			if(value.length > fields[input.name].maxLength) 
			{
				isValid = false;
			} 
			else 
			{
				isValid = true;
			}
		}
		else
		{
			isValid = true;
		}
	}

	switch(input.type)
	{
		case 'text':
			if(fields[input.name].onlyLetters)
			{
				const pattern = /^[a-zA-ZÀ-ÿ\u00f1\u00d1]+(\s*[a-zA-ZÀ-ÿ\u00f1\u00d1]*)*[a-zA-ZÀ-ÿ\u00f1\u00d1]+$/g;
				if(!pattern.test(value))
				{ 
					isValid = false;
				} 
			}
		break;
		case 'email':
			const patternEmail = /^(([^<>()\[\]\.,;:\s@\"]+(\.[^<>()\[\]\.,;:\s@\"]+)*)|(\".+\"))@(([^<>()[\]\.,;:\s@\"]+\.)+[^<>()[\]\.,;:\s@\"]{2,})$/;
			if(!patternEmail.test(value))
			{
				isValid = false;
			}
		break;
		case 'password':
			let inputPassword = document.getElementsByName('password')[0];
			let inputVerifyPassword = document.getElementsByName('verifyPassword')[0];
			if(inputPassword.value !== inputVerifyPassword.value || inputPassword.value.length < 1 || inputVerifyPassword.value.length < 1 )
			{
				inputVerifyPassword.className = 'form-control is-invalid';
				inputPassword.className = 'form-control is-invalid';
				document.getElementById('message-verifyPassword').hidden = false;
				document.getElementById('message-password').hidden = false;
				isValid = false;
			}
			else
			{
				inputVerifyPassword.className = 'form-control is-valid';
				inputPassword.className = 'form-control is-valid';
				document.getElementById('message-verifyPassword').hidden = true;
				document.getElementById('message-password').hidden = true;
				isValid = true;
			}
		break;
		case 'number':
			if(value > fields[input.name].maxSize)
			{
				isValid = false;
			}

			if(value < fields[input.name].minSize)
			{
				isValid = false;
			}

			let patterDecimalNumber = null;
			if(!fields[input.name].integer)
			{
				patterDecimalNumber = /^\d*(\.\d{1})?\d{0,1}$/;
			}
			else
			{
				patterDecimalNumber = /^([0-9])*$/;
			}

			if(!patterDecimalNumber.test(value))
			{
				isValid = false;
			}
		break;
	}
	

	//Ahora coloreamos el borde de nuestro input
	if(!isValid) 
	{
		// rojo: no es valido
		input.className = 'form-control is-invalid'; // me parece que 'salmon' es un poco menos agresivo que 'red'
		// mostramos mensaje
		message.hidden = false;
	} 
	else 
	{
		// verde: si es valido
		input.className = 'form-control is-valid'; // 'palegreen' se ve mejor que 'green' en mi opinion
		// ocultamos mensaje;
		message.hidden = true;
	}

	// devolvemos el valor de isValid
	return isValid;
}

function verificarInput()
{
	let formValid = true;
	for(const inputElement of document.forms[1])
	{
		console.log(inputElement)
		if(inputElement.type !== "submit")
		{
			if(validateNames(null, inputElement) === false)
			{
				formValid = false;
			}
		}
		
	}

	return formValid;
}

function validateRecoverPassword()
{
	let inputPassword = null;
	let inputVerifyPassword = null
	for(const inputElement of document.forms[0])
	{
		if(inputElement.name == "password")
		{
			inputPassword = inputElement;
		}

		if(inputElement.name == "verifyPassword")
		{
			inputVerifyPassword = inputElement;
		}
	}

	const message = document.getElementById('message-verifyPassword');

	if(inputPassword.value !== inputVerifyPassword.value || inputPassword.value.length < 1 || inputVerifyPassword.value.length < 1 )
	{
		inputVerifyPassword.className = 'form-control is-invalid';
		message.hidden = false;
		return false
	}
	else
	{
		inputPassword.className = 'form-control is-valid';
		inputVerifyPassword.className = 'form-control is-valid';
		message.hidden = true;
		return true;
	}
}

function verificarRecoverPasswordForm()
{
	let formValid = true;
	formValid = validateRecoverPassword();
	return formValid;
}



