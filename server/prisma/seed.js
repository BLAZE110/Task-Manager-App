const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

const users = [
  { name: 'Aarav Sharma', email: 'aarav.sharma@gmail.com', password: 'Aarav@1234' },
  { name: 'Priya Verma', email: 'priya.verma@gmail.com', password: 'Priya@1234' },
  { name: 'Rohan Gupta', email: 'rohan.gupta@gmail.com', password: 'Rohan@1234' },
  { name: 'Ananya Singh', email: 'ananya.singh@gmail.com', password: 'Ananya@1234' },
  { name: 'Vikram Patel', email: 'vikram.patel@gmail.com', password: 'Vikram@1234' },
  { name: 'Neha Reddy', email: 'neha.reddy@gmail.com', password: 'Neha@1234' },
  { name: 'Arjun Kumar', email: 'arjun.kumar@gmail.com', password: 'Arjun@1234' },
  { name: 'Kavya Nair', email: 'kavya.nair@gmail.com', password: 'Kavya@1234' },
  { name: 'Siddharth Joshi', email: 'siddharth.joshi@gmail.com', password: 'Siddharth@1234' },
  { name: 'Meera Iyer', email: 'meera.iyer@gmail.com', password: 'Meera@1234' },
  { name: 'Aditya Mishra', email: 'aditya.mishra@gmail.com', password: 'Aditya@1234' },
  { name: 'Riya Chopra', email: 'riya.chopra@gmail.com', password: 'Riya@1234' },
  { name: 'Karan Mehta', email: 'karan.mehta@gmail.com', password: 'Karan@1234' },
  { name: 'Diya Agarwal', email: 'diya.agarwal@gmail.com', password: 'Diya@1234' },
  { name: 'Ishaan Bose', email: 'ishaan.bose@gmail.com', password: 'Ishaan@1234' },
  { name: 'Tanvi Rao', email: 'tanvi.rao@gmail.com', password: 'Tanvi@1234' },
  { name: 'Rahul Jain', email: 'rahul.jain@gmail.com', password: 'Rahul@1234' },
  { name: 'Sneha Das', email: 'sneha.das@gmail.com', password: 'Sneha@1234' },
  { name: 'Manav Tiwari', email: 'manav.tiwari@gmail.com', password: 'Manav@1234' },
  { name: 'Pooja Saxena', email: 'pooja.saxena@gmail.com', password: 'Pooja@1234' },
];

const projects = [
  { name: 'E-Commerce Platform', description: 'Build a full-stack e-commerce website with payment integration', deadline: '2026-07-15' },
  { name: 'Mobile Banking App', description: 'Develop a secure mobile banking application with biometric auth', deadline: '2026-08-01' },
  { name: 'Healthcare Dashboard', description: 'Patient management dashboard for hospitals and clinics', deadline: '2026-06-30' },
  { name: 'Social Media Analytics', description: 'Real-time social media analytics and reporting tool', deadline: '2026-09-15' },
  { name: 'AI Chatbot System', description: 'Build an AI-powered customer support chatbot', deadline: '2026-07-01' },
  { name: 'Inventory Management', description: 'Warehouse inventory tracking and management system', deadline: '2026-08-20' },
  { name: 'Learning Management System', description: 'Online course platform with video streaming and quizzes', deadline: '2026-10-01' },
  { name: 'Food Delivery App', description: 'Restaurant ordering and delivery tracking application', deadline: '2026-06-15' },
  { name: 'Real Estate Portal', description: 'Property listing and virtual tour web platform', deadline: '2026-09-01' },
  { name: 'Fitness Tracker', description: 'Workout and nutrition tracking with progress analytics', deadline: '2026-07-30' },
];

const taskTemplates = [
  { title: 'Setup project repository', description: 'Initialize Git repo, configure CI/CD, and set up branch protection rules', priority: 'HIGH', status: 'DONE', dueDate: '2026-05-20' },
  { title: 'Design database schema', description: 'Create ERD diagram and define all table relationships', priority: 'HIGH', status: 'DONE', dueDate: '2026-05-25' },
  { title: 'Implement user authentication', description: 'Build signup, login, JWT tokens, and password reset flow', priority: 'HIGH', status: 'IN_PROGRESS', dueDate: '2026-06-01' },
  { title: 'Build REST API endpoints', description: 'Create CRUD endpoints for all resources with proper validation', priority: 'HIGH', status: 'IN_PROGRESS', dueDate: '2026-06-10' },
  { title: 'Create landing page UI', description: 'Design and implement responsive landing page with hero section', priority: 'MEDIUM', status: 'TODO', dueDate: '2026-06-15' },
  { title: 'Implement search functionality', description: 'Full-text search with filters, sorting, and pagination', priority: 'MEDIUM', status: 'TODO', dueDate: '2026-06-20' },
  { title: 'Setup payment gateway', description: 'Integrate Stripe or Razorpay for payment processing', priority: 'HIGH', status: 'TODO', dueDate: '2026-07-01' },
  { title: 'Write unit tests', description: 'Achieve 80% code coverage with Jest and React Testing Library', priority: 'MEDIUM', status: 'IN_PROGRESS', dueDate: '2026-06-25' },
  { title: 'Deploy to staging', description: 'Setup staging environment on AWS/Railway with CI/CD pipeline', priority: 'LOW', status: 'TODO', dueDate: '2026-07-05' },
  { title: 'Performance optimization', description: 'Implement lazy loading, code splitting, and image optimization', priority: 'MEDIUM', status: 'DONE', dueDate: '2026-05-30' },
  { title: 'Mobile responsive design', description: 'Ensure all pages work perfectly on mobile and tablet devices', priority: 'HIGH', status: 'IN_PROGRESS', dueDate: '2026-06-05' },
  { title: 'Implement notifications', description: 'Push notifications, email alerts, and in-app notification system', priority: 'MEDIUM', status: 'TODO', dueDate: '2026-06-30' },
  { title: 'Data analytics dashboard', description: 'Charts, graphs, and export functionality for business metrics', priority: 'LOW', status: 'TODO', dueDate: '2026-07-10' },
  { title: 'Security audit', description: 'Run OWASP Top 10 checks and fix vulnerabilities', priority: 'HIGH', status: 'DONE', dueDate: '2026-05-28' },
  { title: 'API documentation', description: 'Generate Swagger/OpenAPI docs for all API endpoints', priority: 'LOW', status: 'IN_PROGRESS', dueDate: '2026-06-08' },
  { title: 'User onboarding flow', description: 'Step-by-step guided tour for new users with tooltips', priority: 'MEDIUM', status: 'TODO', dueDate: '2026-06-18' },
  { title: 'File upload system', description: 'Implement drag-and-drop file upload with cloud storage', priority: 'MEDIUM', status: 'DONE', dueDate: '2026-05-22' },
  { title: 'Role-based access control', description: 'Implement granular permissions for admin, manager, and user roles', priority: 'HIGH', status: 'DONE', dueDate: '2026-05-26' },
  { title: 'Caching layer setup', description: 'Redis caching for frequently accessed data and API responses', priority: 'LOW', status: 'TODO', dueDate: '2026-07-15' },
  { title: 'Production deployment', description: 'Final deployment to production with monitoring and alerts', priority: 'HIGH', status: 'TODO', dueDate: '2026-07-20' },
];

async function main() {
  console.log('🗑️  Deleting all existing data...');
  
  // Delete in order to respect foreign key constraints
  await prisma.activityLog.deleteMany({});
  await prisma.comment.deleteMany({});
  await prisma.notification.deleteMany({});
  await prisma.taskAttachment.deleteMany({});
  await prisma.taskDependency.deleteMany({});
  // Disconnect many-to-many relation
  const allTasks = await prisma.task.findMany({ select: { id: true } });
  for (const t of allTasks) {
    await prisma.task.update({ where: { id: t.id }, data: { assignees: { set: [] } } });
  }
  await prisma.task.deleteMany({});
  await prisma.projectMember.deleteMany({});
  await prisma.project.deleteMany({});
  await prisma.user.deleteMany({});
  
  console.log('✅ All data deleted.');

  // Create users
  console.log('👤 Creating 20 users...');
  const createdUsers = [];
  for (const u of users) {
    const hashed = await bcrypt.hash(u.password, 12);
    const created = await prisma.user.create({
      data: { name: u.name, email: u.email, password: hashed },
    });
    createdUsers.push({ ...created, plainPassword: u.password });
  }
  console.log(`✅ ${createdUsers.length} users created.`);

  // Write users.txt
  const fs = require('fs');
  const path = require('path');
  
  let usersTxt = 'TEAM TASK MANAGER - USER CREDENTIALS\n';
  usersTxt += '='.repeat(60) + '\n\n';
  usersTxt += 'No.  | Name                 | Email                          | Password\n';
  usersTxt += '-'.repeat(90) + '\n';
  createdUsers.forEach((u, i) => {
    usersTxt += `${String(i + 1).padStart(3)}  | ${u.name.padEnd(20)} | ${u.email.padEnd(30)} | ${u.plainPassword}\n`;
  });
  fs.writeFileSync(path.join(__dirname, '..', '..', 'users.txt'), usersTxt);
  console.log('📄 users.txt written.');

  // Create projects (each by a random user as admin)
  console.log('📁 Creating 10 projects...');
  const createdProjects = [];
  const projectAdmins = [0, 2, 4, 6, 8, 1, 3, 5, 7, 9]; // user indices who will be admins
  
  // Additional members for each project (indices into createdUsers)
  const projectMembers = [
    [1, 3, 5, 10],      // project 0
    [0, 4, 6, 11],      // project 1
    [1, 5, 7, 12],      // project 2
    [2, 8, 9, 13],      // project 3
    [3, 6, 10, 14],     // project 4
    [0, 7, 11, 15],     // project 5
    [2, 4, 12, 16],     // project 6
    [1, 8, 13, 17],     // project 7
    [3, 9, 14, 18],     // project 8
    [0, 6, 15, 19],     // project 9
  ];

  for (let i = 0; i < projects.length; i++) {
    const adminUser = createdUsers[projectAdmins[i]];
    const proj = await prisma.project.create({
      data: {
        name: projects[i].name,
        description: projects[i].description,
        deadline: new Date(projects[i].deadline),
        ownerId: adminUser.id,
        members: {
          create: [
            { userId: adminUser.id, role: 'ADMIN' },
            ...projectMembers[i].map(idx => ({ userId: createdUsers[idx].id, role: 'MEMBER' })),
          ],
        },
      },
    });
    
    // Log project creation
    await prisma.activityLog.create({
      data: { projectId: proj.id, userId: adminUser.id, action: 'CREATED', newValue: proj.name },
    });
    
    createdProjects.push({ ...proj, adminIndex: projectAdmins[i], memberIndices: projectMembers[i] });
  }
  console.log(`✅ ${createdProjects.length} projects created.`);

  // Create tasks distributed across projects
  console.log('📝 Creating 20 tasks...');
  const createdTasks = [];
  
  // Assign 2 tasks per project
  for (let i = 0; i < 20; i++) {
    const projIndex = i % 10;
    const proj = createdProjects[projIndex];
    const adminUser = createdUsers[proj.adminIndex];
    const task = taskTemplates[i];
    
    // Pick 1-2 assignees from the project members
    const availableMembers = [proj.adminIndex, ...proj.memberIndices];
    const assigneeCount = (i % 3 === 0) ? 2 : 1;
    const assigneeIndices = availableMembers.slice(0, assigneeCount);
    
    const created = await prisma.task.create({
      data: {
        title: task.title,
        description: task.description,
        status: task.status,
        priority: task.priority,
        dueDate: new Date(task.dueDate),
        projectId: proj.id,
        createdById: adminUser.id,
        assignees: { connect: assigneeIndices.map(idx => ({ id: createdUsers[idx].id })) },
      },
    });

    // Task-level activity log
    await prisma.activityLog.create({
      data: { taskId: created.id, userId: adminUser.id, action: 'CREATED', newValue: created.title },
    });
    // Project-level activity log
    await prisma.activityLog.create({
      data: { projectId: proj.id, userId: adminUser.id, action: 'TASK_ADDED', newValue: created.title },
    });

    createdTasks.push({
      ...created,
      projectName: projects[projIndex].name,
      assignees: assigneeIndices.map(idx => createdUsers[idx].name),
      createdBy: adminUser.name,
    });
  }
  console.log(`✅ ${createdTasks.length} tasks created.`);

  // Write project.txt
  let projectTxt = 'TEAM TASK MANAGER - PROJECTS & TASKS\n';
  projectTxt += '='.repeat(80) + '\n\n';
  
  projectTxt += 'PROJECTS\n';
  projectTxt += '-'.repeat(80) + '\n';
  projectTxt += 'No.  | Project Name                    | Admin              | Members | Deadline\n';
  projectTxt += '-'.repeat(80) + '\n';
  createdProjects.forEach((p, i) => {
    const adminName = createdUsers[p.adminIndex].name;
    const memberCount = p.memberIndices.length + 1; // +1 for admin
    projectTxt += `${String(i + 1).padStart(3)}  | ${projects[i].name.padEnd(31)} | ${adminName.padEnd(18)} | ${String(memberCount).padStart(7)} | ${projects[i].deadline}\n`;
  });

  projectTxt += '\n\nTASKS\n';
  projectTxt += '-'.repeat(110) + '\n';
  projectTxt += 'No.  | Task Title                        | Project                         | Status       | Priority | Due Date   | Assignees\n';
  projectTxt += '-'.repeat(110) + '\n';
  createdTasks.forEach((t, i) => {
    projectTxt += `${String(i + 1).padStart(3)}  | ${t.title.padEnd(33)} | ${t.projectName.padEnd(31)} | ${t.status.padEnd(12)} | ${t.priority.padEnd(8)} | ${taskTemplates[i].dueDate} | ${t.assignees.join(', ')}\n`;
  });

  fs.writeFileSync(path.join(__dirname, '..', '..', 'project.txt'), projectTxt);
  console.log('📄 project.txt written.');

  console.log('\n🎉 Seeding complete!');
}

main()
  .catch(e => { console.error(e); process.exit(1); })
  .finally(() => prisma.$disconnect());
