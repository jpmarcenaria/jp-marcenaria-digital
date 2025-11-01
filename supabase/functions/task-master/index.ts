import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
import { getCorsHeaders } from '../_shared/cors.ts'

const corsHeaders = getCorsHeaders()

interface ProjectData {
  name: string
  description?: string
  client_id: string
  project_type: string
  priority?: string
  estimated_hours?: number
  estimated_cost?: number
  quoted_price?: number
  start_date?: string
  estimated_completion_date?: string
  requirements?: string
  materials_list?: any[]
  template_id?: string
}

interface TaskData {
  name: string
  description?: string
  project_id: string
  parent_task_id?: string
  priority?: string
  estimated_hours?: number
  estimated_cost?: number
  start_date?: string
  due_date?: string
  assigned_to?: string
  dependencies?: string[]
  tags?: string[]
}

interface ClientData {
  name: string
  email?: string
  phone?: string
  whatsapp?: string
  address?: string
  city?: string
  state?: string
  zip_code?: string
  cpf_cnpj?: string
  notes?: string
  preferred_contact?: string
}

interface TimeEntryData {
  project_id: string
  task_id?: string
  description?: string
  start_time: string
  end_time?: string
  hourly_rate?: number
  is_billable?: boolean
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      {
        global: {
          headers: { Authorization: req.headers.get('Authorization')! },
        },
      }
    )

    const url = new URL(req.url)
    const path = url.pathname.split('/').filter(Boolean)
    const method = req.method
    const action = path[path.length - 1] || 'dashboard'

    // Get authenticated user
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return new Response(
        JSON.stringify({ error: 'Unauthorized' }),
        { 
          status: 401, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    }

    // Route handling
    switch (action) {
      case 'dashboard':
        return await handleDashboard(supabase, method)
      
      case 'projects':
        return await handleProjects(supabase, method, req, user.id)
      
      case 'tasks':
        return await handleTasks(supabase, method, req, user.id)
      
      case 'clients':
        return await handleClients(supabase, method, req)
      
      case 'resources':
        return await handleResources(supabase, method, req)
      
      case 'time-tracking':
        return await handleTimeTracking(supabase, method, req, user.id)
      
      case 'reports':
        return await handleReports(supabase, method, req)
      
      case 'templates':
        return await handleTemplates(supabase, method, req)
      
      default:
        return new Response(
          JSON.stringify({ error: 'Endpoint not found' }),
          { 
            status: 404, 
            headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
          }
        )
    }
  } catch (error) {
    console.error('Task Master API Error:', error)
    return new Response(
      JSON.stringify({ error: 'Internal server error', details: error.message }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    )
  }
})

async function handleDashboard(supabase: any, method: string) {
  if (method !== 'GET') {
    return new Response(
      JSON.stringify({ error: 'Method not allowed' }),
      { status: 405, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }

  // Get dashboard data
  const [projectsResult, tasksResult, clientsResult] = await Promise.all([
    supabase.from('project_dashboard').select('*').limit(10),
    supabase.from('task_dashboard').select('*').eq('is_overdue', true).limit(10),
    supabase.from('clients').select('id, name, email, phone').eq('is_active', true).limit(5)
  ])

  // Get summary statistics
  const [projectStats, taskStats, resourceStats] = await Promise.all([
    supabase.from('projects').select('status').then((res: any) => {
      const stats = res.data?.reduce((acc: any, p: any) => {
        acc[p.status] = (acc[p.status] || 0) + 1
        return acc
      }, {}) || {}
      return stats
    }),
    supabase.from('tasks').select('status, priority').then((res: any) => {
      const stats = res.data?.reduce((acc: any, t: any) => {
        acc.byStatus = acc.byStatus || {}
        acc.byPriority = acc.byPriority || {}
        acc.byStatus[t.status] = (acc.byStatus[t.status] || 0) + 1
        acc.byPriority[t.priority] = (acc.byPriority[t.priority] || 0) + 1
        return acc
      }, {}) || {}
      return stats
    }),
    supabase.from('resource_usage_summary').select('*').eq('needs_restock', true)
  ])

  const dashboardData = {
    projects: {
      recent: projectsResult.data || [],
      stats: projectStats
    },
    tasks: {
      overdue: tasksResult.data || [],
      stats: taskStats
    },
    clients: {
      recent: clientsResult.data || []
    },
    resources: {
      needsRestock: resourceStats.data || []
    }
  }

  return new Response(
    JSON.stringify(dashboardData),
    { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
  )
}

async function handleProjects(supabase: any, method: string, req: Request, userId: string) {
  const url = new URL(req.url)
  const projectId = url.searchParams.get('id')

  switch (method) {
    case 'GET':
      if (projectId) {
        // Get specific project with details
        const { data, error } = await supabase
          .from('project_dashboard')
          .select('*')
          .eq('id', projectId)
          .single()

        if (error) {
          return new Response(
            JSON.stringify({ error: error.message }),
            { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          )
        }

        // Get project tasks
        const { data: tasks } = await supabase
          .from('task_dashboard')
          .select('*')
          .eq('project_id', projectId)
          .order('order_index')

        // Get project resources
        const { data: resources } = await supabase
          .from('project_resources')
          .select(`
            *,
            resource:resources(name, type, unit, cost_per_unit)
          `)
          .eq('project_id', projectId)

        // Get project updates
        const { data: updates } = await supabase
          .from('project_updates')
          .select(`
            *,
            user:auth.users(email)
          `)
          .eq('project_id', projectId)
          .order('created_at', { ascending: false })
          .limit(20)

        return new Response(
          JSON.stringify({
            project: data,
            tasks: tasks || [],
            resources: resources || [],
            updates: updates || []
          }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        )
      } else {
        // Get all projects
        const { data, error } = await supabase
          .from('project_dashboard')
          .select('*')
          .order('created_at', { ascending: false })

        if (error) {
          return new Response(
            JSON.stringify({ error: error.message }),
            { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          )
        }

        return new Response(
          JSON.stringify(data),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        )
      }

    case 'POST':
      const projectData: ProjectData = await req.json()

      // Validate required fields
      if (!projectData.name || !projectData.client_id || !projectData.project_type) {
        return new Response(
          JSON.stringify({ error: 'Missing required fields: name, client_id, project_type' }),
          { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        )
      }

      let insertData = {
        ...projectData,
        created_by: userId,
        assigned_to: userId
      }

      // If using template, create project from template
      if (projectData.template_id) {
        const { data: template } = await supabase
          .from('project_templates')
          .select('*')
          .eq('id', projectData.template_id)
          .single()

        if (template) {
          insertData = {
            ...insertData,
            estimated_hours: template.estimated_hours,
            estimated_cost: template.estimated_cost,
            materials_list: template.template_data.materials || []
          }
        }
      }

      const { data, error } = await supabase
        .from('projects')
        .insert(insertData)
        .select()
        .single()

      if (error) {
        return new Response(
          JSON.stringify({ error: error.message }),
          { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        )
      }

      // If using template, create tasks from template
      if (projectData.template_id) {
        const { data: template } = await supabase
          .from('project_templates')
          .select('template_data')
          .eq('id', projectData.template_id)
          .single()

        if (template?.template_data?.tasks) {
          const tasks = template.template_data.tasks.map((task: any) => ({
            project_id: data.id,
            name: task.name,
            estimated_hours: task.estimated_hours,
            order_index: task.order,
            created_by: userId,
            assigned_to: userId
          }))

          await supabase.from('tasks').insert(tasks)
        }
      }

      // Log project creation
      await supabase.from('project_updates').insert({
        project_id: data.id,
        user_id: userId,
        update_type: 'project_created',
        title: 'Projeto criado',
        content: `Projeto "${data.name}" foi criado`
      })

      return new Response(
        JSON.stringify(data),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )

    case 'PUT':
      if (!projectId) {
        return new Response(
          JSON.stringify({ error: 'Project ID required' }),
          { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        )
      }

      const updateData = await req.json()
      const { data, error } = await supabase
        .from('projects')
        .update(updateData)
        .eq('id', projectId)
        .select()
        .single()

      if (error) {
        return new Response(
          JSON.stringify({ error: error.message }),
          { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        )
      }

      // Log project update
      await supabase.from('project_updates').insert({
        project_id: projectId,
        user_id: userId,
        update_type: 'project_updated',
        title: 'Projeto atualizado',
        content: `Projeto foi atualizado`,
        metadata: updateData
      })

      return new Response(
        JSON.stringify(data),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )

    case 'DELETE':
      if (!projectId) {
        return new Response(
          JSON.stringify({ error: 'Project ID required' }),
          { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        )
      }

      const { error: deleteError } = await supabase
        .from('projects')
        .delete()
        .eq('id', projectId)

      if (deleteError) {
        return new Response(
          JSON.stringify({ error: deleteError.message }),
          { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        )
      }

      return new Response(
        JSON.stringify({ success: true }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )

    default:
      return new Response(
        JSON.stringify({ error: 'Method not allowed' }),
        { status: 405, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
  }
}

async function handleTasks(supabase: any, method: string, req: Request, userId: string) {
  const url = new URL(req.url)
  const taskId = url.searchParams.get('id')
  const projectId = url.searchParams.get('project_id')

  switch (method) {
    case 'GET':
      let query = supabase.from('task_dashboard').select('*')
      
      if (taskId) {
        query = query.eq('id', taskId).single()
      } else if (projectId) {
        query = query.eq('project_id', projectId).order('order_index')
      } else {
        query = query.order('created_at', { ascending: false })
      }

      const { data, error } = await query

      if (error) {
        return new Response(
          JSON.stringify({ error: error.message }),
          { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        )
      }

      return new Response(
        JSON.stringify(data),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )

    case 'POST':
      const taskData: TaskData = await req.json()

      if (!taskData.name || !taskData.project_id) {
        return new Response(
          JSON.stringify({ error: 'Missing required fields: name, project_id' }),
          { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        )
      }

      const { data, error } = await supabase
        .from('tasks')
        .insert({
          ...taskData,
          created_by: userId,
          assigned_to: taskData.assigned_to || userId
        })
        .select()
        .single()

      if (error) {
        return new Response(
          JSON.stringify({ error: error.message }),
          { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        )
      }

      // Log task creation
      await supabase.from('project_updates').insert({
        project_id: taskData.project_id,
        task_id: data.id,
        user_id: userId,
        update_type: 'task_created',
        title: 'Tarefa criada',
        content: `Tarefa "${data.name}" foi criada`
      })

      return new Response(
        JSON.stringify(data),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )

    case 'PUT':
      if (!taskId) {
        return new Response(
          JSON.stringify({ error: 'Task ID required' }),
          { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        )
      }

      const updateData = await req.json()
      const { data, error } = await supabase
        .from('tasks')
        .update(updateData)
        .eq('id', taskId)
        .select()
        .single()

      if (error) {
        return new Response(
          JSON.stringify({ error: error.message }),
          { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        )
      }

      // Log task update
      await supabase.from('project_updates').insert({
        project_id: data.project_id,
        task_id: taskId,
        user_id: userId,
        update_type: 'task_updated',
        title: 'Tarefa atualizada',
        content: `Tarefa "${data.name}" foi atualizada`,
        metadata: updateData
      })

      return new Response(
        JSON.stringify(data),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )

    default:
      return new Response(
        JSON.stringify({ error: 'Method not allowed' }),
        { status: 405, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
  }
}

async function handleClients(supabase: any, method: string, req: Request) {
  const url = new URL(req.url)
  const clientId = url.searchParams.get('id')

  switch (method) {
    case 'GET':
      let query = supabase.from('clients').select('*')
      
      if (clientId) {
        query = query.eq('id', clientId).single()
      } else {
        query = query.eq('is_active', true).order('name')
      }

      const { data, error } = await query

      if (error) {
        return new Response(
          JSON.stringify({ error: error.message }),
          { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        )
      }

      return new Response(
        JSON.stringify(data),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )

    case 'POST':
      const clientData: ClientData = await req.json()

      if (!clientData.name) {
        return new Response(
          JSON.stringify({ error: 'Missing required field: name' }),
          { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        )
      }

      const { data, error } = await supabase
        .from('clients')
        .insert(clientData)
        .select()
        .single()

      if (error) {
        return new Response(
          JSON.stringify({ error: error.message }),
          { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        )
      }

      return new Response(
        JSON.stringify(data),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )

    default:
      return new Response(
        JSON.stringify({ error: 'Method not allowed' }),
        { status: 405, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
  }
}

async function handleResources(supabase: any, method: string, req: Request) {
  switch (method) {
    case 'GET':
      const { data, error } = await supabase
        .from('resource_usage_summary')
        .select('*')
        .order('name')

      if (error) {
        return new Response(
          JSON.stringify({ error: error.message }),
          { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        )
      }

      return new Response(
        JSON.stringify(data),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )

    default:
      return new Response(
        JSON.stringify({ error: 'Method not allowed' }),
        { status: 405, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
  }
}

async function handleTimeTracking(supabase: any, method: string, req: Request, userId: string) {
  switch (method) {
    case 'GET':
      const url = new URL(req.url)
      const projectId = url.searchParams.get('project_id')
      const startDate = url.searchParams.get('start_date')
      const endDate = url.searchParams.get('end_date')

      let query = supabase.from('time_tracking_summary').select('*')
      
      if (projectId) query = query.eq('project_id', projectId)
      if (startDate) query = query.gte('work_date', startDate)
      if (endDate) query = query.lte('work_date', endDate)

      const { data, error } = await query.order('work_date', { ascending: false })

      if (error) {
        return new Response(
          JSON.stringify({ error: error.message }),
          { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        )
      }

      return new Response(
        JSON.stringify(data),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )

    case 'POST':
      const timeData: TimeEntryData = await req.json()

      if (!timeData.project_id || !timeData.start_time) {
        return new Response(
          JSON.stringify({ error: 'Missing required fields: project_id, start_time' }),
          { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        )
      }

      const { data, error } = await supabase
        .from('time_entries')
        .insert({
          ...timeData,
          user_id: userId
        })
        .select()
        .single()

      if (error) {
        return new Response(
          JSON.stringify({ error: error.message }),
          { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        )
      }

      return new Response(
        JSON.stringify(data),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )

    default:
      return new Response(
        JSON.stringify({ error: 'Method not allowed' }),
        { status: 405, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
  }
}

async function handleReports(supabase: any, method: string, req: Request) {
  if (method !== 'GET') {
    return new Response(
      JSON.stringify({ error: 'Method not allowed' }),
      { status: 405, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }

  const url = new URL(req.url)
  const reportType = url.searchParams.get('type') || 'summary'

  switch (reportType) {
    case 'summary':
      // Get overall summary
      const [projects, tasks, resources, timeEntries] = await Promise.all([
        supabase.from('projects').select('status, project_type, estimated_cost, actual_cost'),
        supabase.from('tasks').select('status, priority'),
        supabase.from('resource_usage_summary').select('*'),
        supabase.from('time_tracking_summary').select('total_hours, total_cost')
      ])

      return new Response(
        JSON.stringify({
          projects: projects.data || [],
          tasks: tasks.data || [],
          resources: resources.data || [],
          timeTracking: timeEntries.data || []
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )

    default:
      return new Response(
        JSON.stringify({ error: 'Invalid report type' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
  }
}

async function handleTemplates(supabase: any, method: string, req: Request) {
  switch (method) {
    case 'GET':
      const { data, error } = await supabase
        .from('project_templates')
        .select('*')
        .eq('is_active', true)
        .order('name')

      if (error) {
        return new Response(
          JSON.stringify({ error: error.message }),
          { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        )
      }

      return new Response(
        JSON.stringify(data),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )

    default:
      return new Response(
        JSON.stringify({ error: 'Method not allowed' }),
        { status: 405, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
  }
}