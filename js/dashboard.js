document.addEventListener('DOMContentLoaded', async () => {
    // Verificar rol y cargar contenido adecuado
    const { data: { session } } = await supabase.auth.getSession();
    const { data: userData } = await supabase
        .from('users')
        .select('role, credits')
        .eq('id', session.user.id)
        .single();
        
    if (userData.role === 'admin') {
        loadAdminContent();
    }
    
    // Mostrar créditos disponibles
    document.getElementById('credits-display')?.textContent = `Créditos: ${userData.credits || 0}`;
});

async function loadAdminContent() {
    const contentDiv = document.getElementById('admin-content');
    
    // Cargar usuarios por defecto
    const { data: users, error } = await supabase
        .from('users')
        .select('id, email, role, approved, credits');
        
    if (!error) {
        let html = `
            <h3>Gestión de Usuarios</h3>
            <table class="table table-striped">
                <thead>
                    <tr>
                        <th>Email</th>
                        <th>Rol</th>
                        <th>Aprobado</th>
                        <th>Créditos</th>
                        <th>Acciones</th>
                    </tr>
                </thead>
                <tbody>
        `;
        
        users.forEach(user => {
            html += `
                <tr>
                    <td>${user.email}</td>
                    <td>${user.role}</td>
                    <td>${user.approved ? 'Sí' : 'No'}</td>
                    <td>${user.credits || 0}</td>
                    <td>
                        <button class="btn btn-sm btn-primary approve-btn" data-id="${user.id}">${user.approved ? 'Desaprobar' : 'Aprobar'}</button>
                        <button class="btn btn-sm btn-success add-credits-btn" data-id="${user.id}">Agregar Créditos</button>
                    </td>
                </tr>
            `;
        });
        
        html += `</tbody></table>`;
        contentDiv.innerHTML = html;
        
        // Agregar event listeners a los botones
        document.querySelectorAll('.approve-btn').forEach(btn => {
            btn.addEventListener('click', async (e) => {
                const userId = e.target.getAttribute('data-id');
                const currentStatus = e.target.textContent === 'Aprobar';
                
                const { error } = await supabase
                    .from('users')
                    .update({ approved: currentStatus })
                    .eq('id', userId);
                    
                if (!error) {
                    loadAdminContent();
                }
            });
        });
        
        document.querySelectorAll('.add-credits-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const userId = e.target.getAttribute('data-id');
                const amount = prompt('Ingrese la cantidad de créditos a agregar:');
                
                if (amount && !isNaN(amount)) {
                    supabase.rpc('add_credits', {
                        user_id: userId,
                        amount: parseFloat(amount)
                    }).then(({ error }) => {
                        if (!error) {
                            loadAdminContent();
                        }
                    });
                }
            });
        });
    }
}