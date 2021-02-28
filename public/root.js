
$('#password').keyup((e)=> {
    const password = $('#password').val()
    
    if(password.length >= 8){
        // valid password : grater than 8 characters
        $('#submit').prop('disabled', false)
        $('#password').css('color', 'green')
    }else{
        // invalid password :  less than 8 characters
        $('#submit').prop('disabled', true)
        $('#password').css('color', 'red')
    }
})