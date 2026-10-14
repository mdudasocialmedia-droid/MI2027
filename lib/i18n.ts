export type AppLocale = "es-ES" | "pt-PT";

export const LOCALE_STORAGE_KEY = "luna-planner-locale";
export const LOCALE_COOKIE_KEY = "luna-planner-locale";

export function normalizeLocale(value?: string | null): AppLocale {
  return value?.toLowerCase().startsWith("pt") ? "pt-PT" : "es-ES";
}

export const portugueseTranslations: Record<string, string> = {
  "Mi 2027": "Luna Planner", Inicio: "Início", Agenda: "Agenda", Hábitos: "Hábitos", Metas: "Objetivos",
  Dinero: "Dinheiro", Diario: "Diário", Logros: "Conquistas", "Mi Agenda": "A minha agenda",
  "Mis Hábitos": "Os meus hábitos", "Mis Metas": "Os meus objetivos", "Mi Dinero": "O meu dinheiro",
  "Mi Diario": "O meu diário", "Mis Logros": "As minhas conquistas", "Volver al inicio": "Voltar ao início",
  "Volver al dashboard": "Voltar ao painel", "Hola, Duda": "Olá, Duda", "¡Hola, Duda!": "Olá, Duda!",
  "Buenos días": "Bom dia", "Tu progreso de hoy": "O teu progresso de hoje", "Mis tareas de hoy": "As minhas tarefas de hoje",
  "Tareas de hoy": "Tarefas de hoje", "Añadir tarea": "Adicionar tarefa", "Nueva tarea": "Nova tarefa",
  Añadir: "Adicionar", Guardar: "Guardar", Cancelar: "Cancelar", Editar: "Editar", Eliminar: "Eliminar",
  Cerrar: "Fechar", Buscar: "Pesquisar", Filtrar: "Filtrar", Todo: "Tudo", Todos: "Todos", Todas: "Todas",
  Completada: "Concluída", Completadas: "Concluídas", Pendiente: "Pendente", Pendientes: "Pendentes",
  "Mi semana": "A minha semana", "Mis hábitos": "Os meus hábitos", "Mi meta del año": "O meu objetivo do ano",
  "Ver todos": "Ver todos", "Ver todas": "Ver todas", "Mi racha": "A minha sequência", "Mi estado hoy": "O meu estado hoje",
  Nivel: "Nível", Motivada: "Motivada", "¡Vamos!": "Vamos!", "Disciplina hoy, resultados mañana.": "Disciplina hoje, resultados amanhã.",
  "Un poquito de ti, cada día": "Um pouco de ti, todos os dias", "Querido diario...": "Querido diário...",
  "Hoy agradezco...": "Hoje agradeço...", "Guardar entrada": "Guardar registo", "Editar entrada": "Editar registo",
  "Eliminar entrada": "Eliminar registo", "Historial de entradas": "Histórico de registos", "Buscar entradas": "Pesquisar registos",
  "Todas las emociones": "Todas as emoções", "Días registrados": "Dias registados", Gratitudes: "Agradecimentos",
  "Sin entradas todavía": "Ainda não há registos", "No hay resultados": "Não há resultados",
  "¿Eliminar esta entrada?": "Eliminar este registo?", "Selecciona cómo te sientes hoy": "Seleciona como te sentes hoje",
  "Escribe algo antes de guardar": "Escreve algo antes de guardar", "Resumen mensual": "Resumo mensal",
  Ingresos: "Rendimentos", Gastos: "Despesas", Saldo: "Saldo", "Nueva transacción": "Nova transação",
  "Editar transacción": "Editar transação", Transacciones: "Transações", Importe: "Montante", Categoría: "Categoria",
  Fecha: "Data", Descripción: "Descrição", Ingreso: "Rendimento", Gasto: "Despesa",
  "Todas las categorías": "Todas as categorias", "Presupuestos del mes": "Orçamentos do mês", Presupuesto: "Orçamento",
  "Desafío financiero": "Desafio financeiro", "Sin movimientos este mes": "Sem movimentos este mês",
  "¿Eliminar esta transacción?": "Eliminar esta transação?", Personal: "Pessoal", Trabajo: "Trabalho", Salud: "Saúde",
  Familia: "Família", Estudios: "Estudos", Otros: "Outros", Finanzas: "Finanças", Alimentación: "Alimentação",
  Vivienda: "Habitação", Transporte: "Transportes", Ocio: "Lazer", Compras: "Compras", Regalos: "Presentes",
  Nómina: "Salário", Ventas: "Vendas", "Nueva meta": "Novo objetivo", "Editar meta": "Editar objetivo",
  "Crear meta": "Criar objetivo", "Título de la meta": "Título do objetivo", "Fecha de inicio": "Data de início",
  Plazo: "Prazo", Progreso: "Progresso", Etapas: "Etapas", "Nueva etapa": "Nova etapa", "Añadir etapa": "Adicionar etapa",
  "Metas completadas": "Objetivos concluídos", "Sin metas todavía": "Ainda não há objetivos", "¿Eliminar esta meta?": "Eliminar este objetivo?",
  "Nuevo hábito": "Novo hábito", "Editar hábito": "Editar hábito", "Crear hábito": "Criar hábito", "Nombre del hábito": "Nome do hábito",
  Semanal: "Semanal", Frecuencia: "Frequência", "Días de la semana": "Dias da semana", "Progreso semanal": "Progresso semanal",
  "Racha actual": "Sequência atual", "Calendario de seguimiento": "Calendário de acompanhamento",
  "Sin hábitos todavía": "Ainda não há hábitos", "¿Eliminar este hábito?": "Eliminar este hábito?", "Nuevo evento": "Novo evento",
  "Editar evento": "Editar evento", "Crear evento": "Criar evento", "Título del evento": "Título do evento",
  "Hora de inicio": "Hora de início", "Hora de fin": "Hora de fim", "Todo el día": "Todo o dia", Recurrencia: "Recorrência",
  Ninguna: "Nenhuma", Diaria: "Diária", Mensual: "Mensal", "Vista mensual": "Vista mensal", "Vista semanal": "Vista semanal",
  "Vista diaria": "Vista diária", Mes: "Mês", Semana: "Semana", Día: "Dia", Hoy: "Hoje", "Eventos del día": "Eventos do dia",
  "Tareas del día": "Tarefas do dia", "Sin eventos": "Sem eventos", "Sin tareas": "Sem tarefas",
  "¿Eliminar este evento?": "Eliminar este evento?", "La hora de fin debe ser posterior a la hora de inicio.": "A hora de fim deve ser posterior à hora de início.",
  "Ya existe un evento similar en este horario.": "Já existe um evento semelhante neste horário.", "Puntos XP": "Pontos XP",
  "Nivel actual": "Nível atual", "Próxima conquista": "Próxima conquista", "Conquistas desbloqueadas": "Conquistas desbloqueadas",
  "Conquistas bloqueadas": "Conquistas bloqueadas", "Historial de conquistas": "Histórico de conquistas", Desbloqueada: "Desbloqueada",
  Bloqueada: "Bloqueada", "Aún no has desbloqueado conquistas.": "Ainda não desbloqueaste conquistas.",
  "Planifica tu tiempo con intención": "Planeia o teu tempo com intenção", "Construye la vida que sueñas, un día cada vez.": "Constrói a vida com que sonhas, um dia de cada vez.",
  "Elige tu idioma": "Escolhe o teu idioma", "Año de planificación": "Ano de planeamento", "Iniciar sesión": "Iniciar sessão",
  "Crear cuenta": "Criar conta", "Correo electrónico": "E-mail", Contraseña: "Palavra-passe", "Confirmar contraseña": "Confirmar palavra-passe",
  "¿Olvidaste tu contraseña?": "Esqueceste-te da palavra-passe?", "¿No tienes cuenta?": "Ainda não tens conta?",
  "¿Ya tienes cuenta?": "Já tens conta?", "Recuperar contraseña": "Recuperar palavra-passe", "Enviar enlace": "Enviar ligação",
  "Nueva contraseña": "Nova palavra-passe", "Actualizar contraseña": "Atualizar palavra-passe", "Volver a iniciar sesión": "Voltar ao início de sessão",
  "Acceso restringido": "Acesso restrito", "Tu cuenta no tiene acceso a Luna Planner.": "A tua conta não tem acesso ao Luna Planner.",
  "Cerrar sesión": "Terminar sessão", "Estamos preparando tu espacio personal": "Estamos a preparar o teu espaço pessoal",
  "Tu año, a tu manera": "O teu ano, à tua maneira",
  Idioma: "Idioma", Año: "Ano", "Ir al inicio": "Ir para o início", "Navegación principal": "Navegação principal",
  "Navegación móvil": "Navegação móvel", "Un pequeño paso cuenta": "Um pequeno passo conta",
  "Sigue construyendo tu mejor año, un día cada vez.": "Continua a construir o teu melhor ano, um dia de cada vez.",
  "Mis insignias": "As minhas insígnias", "Desbloqueadas solo con acciones guardadas en Luna Planner.": "Desbloqueadas apenas com ações guardadas no Luna Planner.",
  "Progreso por área": "Progresso por área", "Una vista honesta de tus acciones registradas": "Uma visão honesta das tuas ações registadas",
  "Cada insignia cuenta una historia que tú hiciste realidad.": "Cada insígnia conta uma história que tornaste realidade.",
  "Has desbloqueado todas las insignias disponibles.": "Desbloqueaste todas as insígnias disponíveis.", Historial: "Histórico",
  "Momentos que merecen celebrarse": "Momentos que merecem ser celebrados", "Completa una acción para desbloquear tu primer logro.": "Conclui uma ação para desbloquear a tua primeira conquista.",
  "Meta destacada en tu dashboard": "Objetivo em destaque no teu painel", "Todas mis metas": "Todos os meus objetivos",
  "Avanza paso a paso, sin perder de vista lo importante.": "Avança passo a passo, sem perder de vista o que importa.",
  "Tu próxima meta empieza aquí": "O teu próximo objetivo começa aqui", "+ Crear mi primera meta": "+ Criar o meu primeiro objetivo",
  "Dale dirección a tus sueños y celebra cada avance.": "Dá direção aos teus sonhos e celebra cada progresso.", Anual: "Anual",
  "Destacar en el Dashboard": "Destacar no painel", "Será tu meta anual principal": "Será o teu principal objetivo anual",
  Color: "Cor", "Guardar meta": "Guardar objetivo", "Nombre de la meta": "Nome do objetivo",
  "Solo se muestran movimientos realmente registrados.": "São apresentados apenas movimentos realmente registados.", Movimientos: "Movimentos",
  "Claridad para decidir, tranquilidad para avanzar.": "Clareza para decidir, tranquilidade para avançar.", "Nuevo movimiento": "Novo movimento",
  "Aún no hay movimientos": "Ainda não há movimentos", "Añade un ingreso o gasto para ver tu resumen real.": "Adiciona um rendimento ou despesa para veres o teu resumo real.",
  "+ Registrar movimiento": "+ Registar movimento", "Gastos por categoría": "Despesas por categoria", "Distribución del mes seleccionado": "Distribuição do mês selecionado",
  "Registra gastos para ver el gráfico.": "Regista despesas para veres o gráfico.", "Desafío del mes": "Desafio do mês",
  "Registra 5 movimientos": "Regista 5 movimentos", "Tu progreso se calcula únicamente con registros reales.": "O teu progresso é calculado apenas com registos reais.",
  "¡Reto completado!": "Desafio concluído!", "Registro completo": "Registo completo", Presupuestos: "Orçamentos",
  "Límites mensuales por categoría": "Limites mensais por categoria", "Sin presupuestos para este mes.": "Sem orçamentos para este mês.",
  "¿Eliminar este movimiento?": "Eliminar este movimento?", "Este movimiento ya está registrado.": "Este movimento já está registado.",
  "Tu tiempo, tus planes y espacio para lo que importa.": "O teu tempo, os teus planos e espaço para o que importa.",
  "Periodo anterior": "Período anterior", "Periodo siguiente": "Período seguinte", "Vista del calendario": "Vista do calendário",
  "Plan del día": "Plano do dia", "Fecha seleccionada": "Data selecionada", "Sin compromisos todavía.": "Ainda não há compromissos.",
  "Añadir compromiso": "Adicionar compromisso", "Compartidas con tu dashboard": "Partilhadas com o teu painel",
  "Nueva tarea...": "Nova tarefa...", "Título de la nueva tarea": "Título da nova tarefa", "No hay tareas para este día.": "Não há tarefas para este dia.",
  "Evento de día entero": "Evento de dia inteiro", "Sin horario específico": "Sem horário específico", "Editar compromiso": "Editar compromisso",
  "Nuevo compromiso": "Novo compromisso", Título: "Título", "Añade notas o detalles...": "Adiciona notas ou detalhes...",
  "Sí, eliminar": "Sim, eliminar", "Un día lleno de posibilidades": "Um dia cheio de possibilidades", "Todavía no hay compromisos.": "Ainda não há compromissos.",
  "+ Crear el primero": "+ Criar o primeiro", "Martes, 13 de octubre": "Terça-feira, 13 de outubro",
  "Hoy es un gran día para construir el año que sueñas.": "Hoje é um ótimo dia para construir o ano com que sonhas.",
  "¡Brillas con luz propia! Sigue así.": "Brilhas com luz própria! Continua assim.", "Cada check te acerca un poco más. ¡Vamos!": "Cada check aproxima-te um pouco mais. Vamos!",
  "Crece a tu ritmo": "Cresce ao teu ritmo", nivel: "nível", "Escribe una nueva tarea...": "Escreve uma nova tarefa...", Listo: "Pronto",
  "Tu lista está lista para empezar": "A tua lista está pronta para começar", "Añade tu primera tarea de hoy.": "Adiciona a tua primeira tarefa de hoje.",
  "Un gesto pequeño, todos los días": "Um pequeno gesto, todos os dias", "Tu constancia también merece celebrarse.": "A tua consistência também merece ser celebrada.",
  "Entrada del día": "Registo do dia", "¿Cómo te sientes hoy?": "Como te sentes hoje?", "¿Qué ha hecho especial este día? Escribe aquí lo que necesites...": "O que tornou este dia especial? Escreve aqui aquilo de que precisares...",
  "Algo bonito de hoy...": "Algo bom de hoje...", "Otra cosa que agradeces...": "Outra coisa pela qual estás grata...", "Entrada guardada correctamente.": "Registo guardado com sucesso.",
  "Actualizar entrada": "Atualizar registo", "Mi calendario": "O meu calendário", "Elige un día para escribir o recordar": "Escolhe um dia para escrever ou recordar",
  "Mes anterior": "Mês anterior", "Mes siguiente": "Mês seguinte", "Entradas anteriores": "Registos anteriores",
  "Tus palabras, ordenadas para volver a ellas cuando quieras.": "As tuas palavras, organizadas para voltares a elas quando quiseres.",
  "Buscar en el diario": "Pesquisar no diário", "Buscar por contenido o gratitud...": "Pesquisar por conteúdo ou agradecimento...", "Filtrar por humor": "Filtrar por humor",
  "Todos los humores": "Todos os estados de espírito", "Todavía no hay entradas aquí": "Ainda não há registos aqui", "Escribe tu primera página o ajusta los filtros.": "Escreve a tua primeira página ou ajusta os filtros.",
  "Selecciona uno para ver su seguimiento": "Seleciona um para veres o seu acompanhamento", "Empieza con un hábito pequeño": "Começa com um pequeno hábito",
  "+ Crear hábito": "+ Criar hábito", "La constancia convierte lo pequeño en extraordinario.": "A consistência transforma o pequeno em extraordinário.",
  Seguimiento: "Acompanhamento", "Check-in completado": "Check-in concluído", "Hacer check-in": "Fazer check-in", Nombre: "Nome",
  "Objetivo semanal": "Objetivo semanal", veces: "vezes", Icono: "Ícone", Agua: "Água", Movimiento: "Movimento", Lectura: "Leitura",
  Bienestar: "Bem-estar", Estrella: "Estrela", Naturaleza: "Natureza", "¡Qué alegría tenerte aquí!": "Que bom ter-te aqui!",
  "Tu contraseña": "A tua palavra-passe", "Entrar a Luna Planner ✨": "Entrar no Luna Planner ✨", "Entrando...": "A entrar...",
  "¿Todavía no tienes cuenta?": "Ainda não tens conta?", "¡Tu mejor año empieza aquí!": "O teu melhor ano começa aqui!",
  "¡Revisa tu correo! 💌": "Vê o teu e-mail! 💌", "Si se requiere confirmación, recibirás un enlace para verificar tu cuenta.": "Se for necessária confirmação, receberás uma ligação para validar a tua conta.",
  "Ir a iniciar sesión": "Ir para o início de sessão", "Tu nombre": "O teu nome", "¿Cómo te llamas?": "Como te chamas?", "Mínimo 8 caracteres": "Mínimo de 8 caracteres",
  "Creando cuenta...": "A criar conta...", "Crear mi cuenta ✨": "Criar a minha conta ✨", "¡Siempre hay una nueva oportunidad!": "Há sempre uma nova oportunidade!",
  "¡Revisa tu correo! ✨": "Vê o teu e-mail! ✨", "Si existe una cuenta con ese correo, recibirás un enlace para restablecer tu contraseña.": "Se existir uma conta com esse e-mail, receberás uma ligação para redefinir a palavra-passe.",
  "No te preocupes. Escribe tu correo y te ayudaremos a recuperar el acceso.": "Não te preocupes. Escreve o teu e-mail e ajudamos-te a recuperar o acesso.",
  "Enviando...": "A enviar...", "Enviar enlace de recuperación 💌": "Enviar ligação de recuperação 💌", "← Volver a iniciar sesión": "← Voltar ao início de sessão",
  "¡Un nuevo comienzo!": "Um novo começo!", "¡Contraseña actualizada! 🎉": "Palavra-passe atualizada! 🎉", "Ya puedes iniciar sesión con tu nueva contraseña.": "Já podes iniciar sessão com a tua nova palavra-passe.",
  "Crear nueva contraseña": "Criar nova palavra-passe", "Guardando...": "A guardar...", "Guardar nueva contraseña ✨": "Guardar nova palavra-passe ✨",
  "Verificando tu enlace de recuperación...": "A verificar a tua ligação de recuperação...", "Solicitar otro enlace": "Pedir outra ligação",
  "No pudimos iniciar sesión. Revisa tu correo y contraseña.": "Não foi possível iniciar sessão. Verifica o e-mail e a palavra-passe.",
  "Ocurrió un error de conexión. Inténtalo de nuevo.": "Ocorreu um erro de ligação. Tenta novamente.", "No pudimos crear tu cuenta. Inténtalo de nuevo.": "Não foi possível criar a conta. Tenta novamente.",
  "Error de conexión. Inténtalo nuevamente.": "Erro de ligação. Tenta novamente.", "No pudimos enviar el correo. Inténtalo de nuevo.": "Não foi possível enviar o e-mail. Tenta novamente.",
  "El enlace no es válido o ha caducado. Solicita uno nuevo.": "A ligação não é válida ou expirou. Pede uma nova.", "Abre el enlace de recuperación enviado a tu correo.": "Abre a ligação de recuperação enviada para o teu e-mail.",
  "La contraseña debe tener al menos 8 caracteres.": "A palavra-passe deve ter pelo menos 8 caracteres.", "Las contraseñas no coinciden.": "As palavras-passe não coincidem.",
  "No pudimos cambiar tu contraseña. Solicita otro enlace.": "Não foi possível alterar a palavra-passe. Pede outra ligação.",
  Lun: "Seg", Mar: "Ter", Mié: "Qua", Jue: "Qui", Vie: "Sex", Sáb: "Sáb", Dom: "Dom",
  lun: "seg", mar: "ter", mié: "qua", jue: "qui", vie: "sex", sáb: "sáb", dom: "dom",
  lunes: "segunda-feira", martes: "terça-feira", miércoles: "quarta-feira", jueves: "quinta-feira", viernes: "sexta-feira",
  "No se repite": "Não se repete", "Cada día": "Todos os dias", "Cada semana": "Todas as semanas", "Cada mes": "Todos os meses",
  Tareas: "Tarefas", "Colección completa": "Coleção completa", "XP totales": "XP totais", "XP para subir": "XP para subir",
  "Primer check": "Primeiro check", "Completa tu primera tarea.": "Conclui a tua primeira tarefa.", "En marcha": "Em andamento",
  "Completa cinco tareas distintas.": "Conclui cinco tarefas diferentes.", "Semilla de constancia": "Semente de consistência",
  "Registra tu primer check-in de hábito.": "Regista o teu primeiro check-in de hábito.", "Una semana imparable": "Uma semana imparável",
  "Mantén una racha de siete días.": "Mantém uma sequência de sete dias.", "Objetivo cumplido": "Objetivo alcançado",
  "Completa una meta al 100%.": "Conclui um objetivo a 100%.", "Primer movimiento": "Primeiro movimento",
  "Registra tu primera transacción.": "Regista a tua primeira transação.", "Con intención": "Com intenção",
  "Crea un presupuesto mensual.": "Cria um orçamento mensal.", "Mes en verde": "Mês positivo",
  "Cierra un mes registrado con saldo positivo.": "Fecha um mês registado com saldo positivo.",
  Ejercicio: "Exercício", Gratitud: "Gratidão", "Planificar mi semana": "Planear a minha semana", "Revisar mis finanzas": "Rever as minhas finanças",
  "Entrenar 30 minutos": "Treinar 30 minutos", "Leer 15 minutos": "Ler 15 minutos", "Preparar las comidas": "Preparar as refeições",
  "Ahorrar 6.000 €": "Poupar 6.000 €", "Ahorrar 2.000 €": "Poupar 2.000 €", "Llegar a 4.000 €": "Chegar aos 4.000 €", "Completar 6.000 €": "Completar 6.000 €",
  Sueldo: "Salário", Freelance: "Trabalho independente", Inversiones: "Investimentos", "Otros ingresos": "Outros rendimentos",
  Educación: "Educação", "Otros gastos": "Outras despesas", "Muy triste": "Muito triste", "Bajo de ánimo": "Em baixo",
  Tranquilo: "Tranquilo", Feliz: "Feliz", Genial: "Ótimo",
  "Conquistas": "Conquistas", "Celebra tu progreso": "Celebra o teu progresso", "Cada logro se calcula con tus acciones registradas.": "Cada conquista é calculada com as tuas ações registadas.",
  "Insignias desbloqueadas": "Insígnias desbloqueadas", "Sigue registrando tus avances para desbloquear más.": "Continua a registar os teus progressos para desbloqueares mais.",
  "¡Has desbloqueado todas las insignias!": "Desbloqueaste todas as insígnias!", "Tu constancia ya tiene todas las insignias disponibles.": "A tua consistência já tem todas as insígnias disponíveis.",
  "Mi perfil": "O meu perfil", "Personaliza cómo apareces en tu espacio.": "Personaliza a forma como apareces no teu espaço.", "Cambiar fotografía": "Alterar fotografia", "Fotografía de perfil": "Fotografia de perfil",
  "Nombre visible": "Nome visível", "El correo está asociado a la cuenta y no se puede modificar desde esta pantalla.": "O e-mail está associado à conta e não pode ser alterado neste ecrã.",
  "Idioma preferido": "Idioma preferido", "Español (España)": "Espanhol (Espanha)", "Português (Portugal)": "Português (Portugal)", "Guardar cambios": "Guardar alterações", "Cambios guardados correctamente.": "Alterações guardadas com sucesso.",
  "Cerrarás la sesión de Luna Planner en este dispositivo.": "Terminarás a sessão do Luna Planner neste dispositivo.", "Terminar sesión": "Terminar sessão",
  "Buscar en agenda, hábitos, metas y diario...": "Pesquisar na agenda, hábitos, objetivos e diário...", "No hay resultados en tus datos actuales.": "Não há resultados nos teus dados atuais.",
  "Notificaciones": "Notificações", "Tu planificación": "O teu planeamento", "Marcar como leídas": "Marcar como lidas", "No hay recordatorios pendientes para esta fecha.": "Não há lembretes pendentes para esta data.",
  "Compromiso para hoy": "Compromisso para hoje", "Hábito pendiente hoy": "Hábito pendente hoje", "Plazo próximo:": "Prazo próximo:",
  "Un momento para ti": "Um momento para ti", "¿Qué ha hecho especial este día?": "O que tornou este dia especial?", "Se guarda en tu diario actual": "É guardado no teu diário atual", "Entrada guardada": "Registo guardado",
  "Entradas recientes": "Registos recentes", "Tus palabras, en un solo lugar.": "As tuas palavras, num só lugar.", "Ver diario": "Ver diário", "Aún no hay entradas guardadas.": "Ainda não há registos guardados.",
  "Tu sesión ha terminado.": "A tua sessão terminou.", "JPG, PNG o WebP · máximo 2 MB": "JPG, PNG ou WebP · máximo de 2 MB",
  "La configuración de perfiles o fotografías aún no está disponible en Supabase. Revisa el script de configuración antes de intentar guardar una imagen.": "A configuração de perfis ou fotografias ainda não está disponível no Supabase. Revê o script de configuração antes de tentares guardar uma imagem.",
  "La imagen se guardó en tu cuenta, pero falta configurar la tabla profiles.": "A imagem foi guardada na tua conta, mas falta configurar a tabela profiles.",
  "Fotografía de perfil actualizada.": "Fotografia de perfil atualizada.", "Tu nombre se guardó en la cuenta. Falta configurar la tabla profiles para sincronizarlo allí.": "O teu nome foi guardado na conta. Falta configurar a tabela profiles para o sincronizar lá.",
  "No fue posible guardar los cambios.": "Não foi possível guardar as alterações.", "No fue posible actualizar la fotografía.": "Não foi possível atualizar a fotografia.",
  "Cerrar búsqueda": "Fechar pesquisa", "Cerrar notificaciones": "Fechar notificações", "Estado": "Estado",
};

export function translateToPortuguese(input: string): string {
  const leading = input.match(/^\s*/)?.[0] ?? "";
  const trailing = input.match(/\s*$/)?.[0] ?? "";
  const value = input.trim();
  if (!value) return input;
  const euroMatch = /^([+-]?)((?:\d{1,3}(?:\.\d{3})*|\d+),\d{2})\s*€$/.exec(value);
  if (euroMatch) {
    const amount = Number(euroMatch[2].replace(/\./g, "").replace(",", "."));
    return `${leading}${euroMatch[1]}${new Intl.NumberFormat("pt-PT", { style: "currency", currency: "EUR" }).format(amount)}${trailing}`;
  }
  let translated = portugueseTranslations[value];
  if (!translated) {
    translated = value
      .replace(/\benero\b/gi, "janeiro").replace(/\bfebrero\b/gi, "fevereiro").replace(/\bmarzo\b/gi, "março")
      .replace(/\bmayo\b/gi, "maio").replace(/\bjunio\b/gi, "junho").replace(/\bjulio\b/gi, "julho")
      .replace(/\bseptiembre\b/gi, "setembro").replace(/\boctubre\b/gi, "outubro").replace(/\bnoviembre\b/gi, "novembro")
      .replace(/\bdiciembre\b/gi, "dezembro").replace(/\blunes\b/gi, "segunda-feira").replace(/\bmartes\b/gi, "terça-feira")
      .replace(/\bmiércoles\b/gi, "quarta-feira").replace(/\bjueves\b/gi, "quinta-feira").replace(/\bviernes\b/gi, "sexta-feira");
  }
  translated = translated.replace(/^(\d+) días?$/, "$1 dias").replace(/^(\d+) de (\d+) completadas$/, "$1 de $2 concluídas")
    .replace(/^(\d+) en total$/, "$1 no total").replace(/^(\d+)% completado$/, "$1% concluído")
    .replace(/^de (\d+) insignias$/, "de $1 insígnias").replace(/^Plazo:$/, "Prazo:")
    .replace(/^No hay (.+) para esta fecha\.$/, "Não há $1 para esta data.").replace(/^Eliminar “(.+)”\?$/, "Eliminar “$1”?")
    .replace(/\bene(?=\.?\s+\d{4})/gi, "jan").replace(/\bmay(?=\.?\s+\d{4})/gi, "mai")
    .replace(/\bsept(?=\.?\s+\d{4})/gi, "set").replace(/\boct(?=\.?\s+\d{4})/gi, "out").replace(/\bdic(?=\.?\s+\d{4})/gi, "dez");
  return `${leading}${translated}${trailing}`;
}
