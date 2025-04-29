// Configuración de Supabase
const supabaseUrl = 'https://brzsayjqohyhpssfgqct.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJyenNheWpxb2h5aHBzc2ZncWN0Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDUwMTU5MzYsImV4cCI6MjA2MDU5MTkzNn0.4JNO1yeUcuSnJXOMN_bZRlugDQZFbkyqYgWyQYkUFF8';
const supabase = supabase.createClient(supabaseUrl, supabaseKey);

// Verificar sesión al cargar la página
document.addEventListener('DOMContentLoaded', () => {
    checkSession();
});

async function checkSession() {
    const { data: { session } } = await supabase.auth.getSession();
    
    if (session) {
        // Redirigir según el rol
        const { data: userData, error } = await supabase
            .from('users')
            .select('role')
            .eq('id', session.user.id)
            .single();
            
        if (userData) {
            switch(userData.role) {
                case 'admin':
                    window.location.href = 'dashboard/admin.html';
                    break;
                case 'provider':
                    window.location.href = 'dashboard/provider.html';
                    break;
                case 'distributor':
                    window.location.href = 'dashboard/distributor.html';
                    break;
                default:
                    window.location.href = 'index.html';
            }
        }
    }
}

// Login
document.getElementById('login-form')?.addEventListener('submit', async (e) => {
    e.preventDefault();
    
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;
    
    const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password
    });
    
    if (error) {
        document.getElementById('login-message').innerHTML = `
            <div class="alert alert-danger">${error.message}</div>
        `;
    } else {
        // Verificar si el usuario está aprobado
        const { data: userData, error: userError } = await supabase
            .from('users')
            .select('approved')
            .eq('id', data.user.id)
            .single();
            
        if (userError || !userData.approved) {
            await supabase.auth.signOut();
            document.getElementById('login-message').innerHTML = `
                <div class="alert alert-warning">Tu cuenta está pendiente de aprobación.</div>
            `;
        } else {
            checkSession();
        }
    }
});

// Logout
document.getElementById('logout-btn')?.addEventListener('click', async () => {
    await supabase.auth.signOut();
    window.location.href = '../index.html';
});