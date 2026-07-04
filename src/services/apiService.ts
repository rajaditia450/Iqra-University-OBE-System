import { OBEData, Department, Program, GA, Course, ProgramObjective, InstructorCourse, Student } from '../types';

export const BASE_URL = (import.meta as any).env?.VITE_API_BASE_URL || 'http://localhost:8000/api';

// Detailed institutional mock data for Iqra University OBE fallback
const DEFAULT_FALLBACK_DATA: OBEData = {
  departments: [
    {
      id: 'computing',
      name: 'Department of Computing and Technology',
      vision: 'To emerge as a global leader in computer science research and education by driving technological innovation, solving real-world challenges, and empowering future leaders',
      mission: 'To foster academic excellence and cutting-edge research, positioning our department as a global leader in computer science innovation. By instilling ethical values, technical prowess, and interdisciplinary knowledge, we prepare students for impactful careers in the field. We strive to shape the technological landscape of tomorrow by equipping our students with professionalism, resilience, and a collaborative mindset'
    },
    {
      id: 'business',
      name: 'Department of Business Administration',
      vision: 'To be a leading business school recognized globally for nurturing entrepreneurial mindsets and ethical leadership in the corporate world.',
      mission: 'To empower students with innovative business education, pioneering research capabilities, and ethical principles designed to create future business leaders.'
    },
    {
      id: 'engineering',
      name: 'Department of Engineering and Applied Sciences',
      vision: 'To foster innovation, sustainable development, and global leadership in physical, chemical, and electrical systems development.',
      mission: 'To cultivate engineering leaders through rigorous experiential learning, research excellence, and socially responsible designs.'
    },
    {
      id: 'media',
      name: 'Department of Media and Communications',
      vision: 'To inspire creative thinking, truth seeking, and advanced media production standards for modern media landscapes.',
      mission: 'To prepare future journalists and digital marketers with robust storytelling, visual art principles, and ethical reporting practices.'
    },
    {
      id: 'health',
      name: 'Department of Health and Life Sciences',
      vision: 'To be a center of clinical excellence and biotechnology research that transforms human health and well-being.',
      mission: 'To empower practitioners and researchers through state-of-the-art clinical skills, bioethics education, and dynamic scientific inquiry.'
    }
  ],
  programs: [
    // Computing Department Programs (BSCS, BSAI, BSSE, BSCY)
    {
      id: 'bscs',
      name: 'Bachelor of Science in Computer Science',
      code: 'BSCS',
      departmentId: 'computing',
      pos: [
        { id: 'PO1', text: 'Establishing in-depth understanding of theoretical concepts related to computer science.', mappedGAs: ['GA-1', 'GA-2'] },
        { id: 'PO2', text: 'Applying core Computer Science knowledge and analytical skills to optimally solve real-world problems.', mappedGAs: ['GA-1', 'GA-2', 'GA-3', 'GA-4', 'GA-5'] },
        { id: 'PO3', text: 'Imbuing quest for learning and engaging in continuous professional development in the field of computer science by carrying research and adopting professional practices.', mappedGAs: ['GA-3', 'GA-4', 'GA-6', 'GA-7', 'GA-8', 'GA-10'] },
        { id: 'PO4', text: 'Developing the ability to work in a multi-disciplinary and multi cultural environment in teams incorporating soft skills and maintaining high ethical standards.', mappedGAs: ['GA-6', 'GA-7', 'GA-9'] }
      ]
    },
    {
      id: 'bsai',
      name: 'Bachelor of Science in Artificial Intelligence',
      code: 'BSAI',
      departmentId: 'computing',
      pos: [
        { id: 'PO1', text: 'Establishing in-depth understanding of theoretical concepts related to intelligence representation and reasoning.', mappedGAs: ['GA-1', 'GA-2'] },
        { id: 'PO2', text: 'Applying core AI systems knowledge, deep learning, and analytical skills to optimally solve real-world problems.', mappedGAs: ['GA-1', 'GA-2', 'GA-3', 'GA-4', 'GA-5'] },
        { id: 'PO3', text: 'Imbuing quest for learning and engaging in continuous professional development in the field of artificial intelligence by carrying research and adopting professional practices.', mappedGAs: ['GA-3', 'GA-4', 'GA-6', 'GA-7', 'GA-8', 'GA-10'] },
        { id: 'PO4', text: 'Developing the ability to work in a multi-disciplinary and multicultural environment in teams incorporating soft skills and maintaining high ethical standards in intelligent systems.', mappedGAs: ['GA-6', 'GA-7', 'GA-9'] }
      ]
    },
    {
      id: 'bsse',
      name: 'Bachelor of Science in Software Engineering',
      code: 'BSSE',
      departmentId: 'computing',
      pos: [
        { id: 'PO1', text: 'Mastery of software design patterns and system architecture specifications.', mappedGAs: ['GA-1', 'GA-4'] },
        { id: 'PO2', text: 'Applying software engineering lifecycles and modern testing frameworks to construct robust products.', mappedGAs: ['GA-2', 'GA-4', 'GA-5'] },
        { id: 'PO3', text: 'Understanding of professional and ethical responsibilities in software development.', mappedGAs: ['GA-8', 'GA-9'] },
        { id: 'PO4', text: 'Engaging in lifelong learning to adapt to emerging software frameworks and AI-assisted development tools.', mappedGAs: ['GA-10'] }
      ]
    },
    {
      id: 'bscy',
      name: 'Bachelor of Science in Cyber Security',
      code: 'BSCY',
      departmentId: 'computing',
      pos: [
        { id: 'PO1', text: 'Analyzing security properties and identifying vulnerabilities in networks and cloud architectures.', mappedGAs: ['GA-3', 'GA-4'] },
        { id: 'PO2', text: 'Implementing high-fidelity cryptographic models and access control measures to protect institutional infrastructure.', mappedGAs: ['GA-2', 'GA-5'] },
        { id: 'PO3', text: 'Formulating disaster recovery protocols and ethical hacking methodologies conforming to international standards.', mappedGAs: ['GA-8', 'GA-9'] },
        { id: 'PO4', text: 'Communicating risk profiles and policy compliance metrics effectively with executive stakeholders.', mappedGAs: ['GA-7'] }
      ]
    },

    // Business Department Programs (BBA, BSAF, MBA)
    {
      id: 'bba',
      name: 'Bachelor of Business Administration',
      code: 'BBA',
      departmentId: 'business',
      pos: [
        { id: 'PO1', text: 'Mastering Core Business Management Skills and Analytical Tools.', mappedGAs: ['GA-B1', 'GA-B4'] },
        { id: 'PO2', text: 'Strategic planning, operations synthesis, and ethical decision modeling.', mappedGAs: ['GA-B2', 'GA-B3', 'GA-B5'] },
        { id: 'PO3', text: 'Fostering innovative business development strategies and executive communication.', mappedGAs: ['GA-B3', 'GA-B6', 'GA-B8'] },
        { id: 'PO4', text: 'Developing adaptive management capabilities in multi-dimensional market climates.', mappedGAs: ['GA-B2', 'GA-B7'] }
      ]
    },
    {
      id: 'bsaf',
      name: 'Bachelor of Science in Accounting and Finance',
      code: 'BSAF',
      departmentId: 'business',
      pos: [
        { id: 'PO1', text: 'Applying advanced taxation and compliance mechanisms in financial reporting.', mappedGAs: ['GA-B1', 'GA-B4'] },
        { id: 'PO2', text: 'Executing rigorous quantitative audit procedures and risk assessments for complex institutions.', mappedGAs: ['GA-B4', 'GA-B7'] },
        { id: 'PO3', text: 'Synthesizing investment strategies and portfolio management structures.', mappedGAs: ['GA-B3', 'GA-B8'] },
        { id: 'PO4', text: 'Engaging ethical leadership guidelines in corporate accounting structures.', mappedGAs: ['GA-B2', 'GA-B5'] }
      ]
    },
    {
      id: 'mba',
      name: 'Master of Business Administration',
      code: 'MBA',
      departmentId: 'business',
      pos: [
        { id: 'PO1', text: 'Formulating high-level global market expansion strategies and supply chain management structures.', mappedGAs: ['GA-B3', 'GA-B8'] },
        { id: 'PO2', text: 'Driving executive data-driven decision optimization via business intelligence frameworks.', mappedGAs: ['GA-B1', 'GA-B7'] },
        { id: 'PO3', text: 'Negotiating complex stakeholder values with impeccable corporate communication.', mappedGAs: ['GA-B2', 'GA-B6'] },
        { id: 'PO4', text: 'Championing systemic corporate social responsibility initiatives.', mappedGAs: ['GA-B5'] }
      ]
    },

    // Engineering Department Programs (BEEE, BECE, BECIV)
    {
      id: 'be_ee',
      name: 'Bachelor of Engineering in Electrical Engineering',
      code: 'BEEE',
      departmentId: 'engineering',
      pos: [
        { id: 'PO1', text: 'Designing electrical power systems and modern grid architectures.', mappedGAs: ['GA-E1', 'GA-E2'] },
        { id: 'PO2', text: 'Applying signal processing mechanisms and embedded controls.', mappedGAs: ['GA-E2', 'GA-E3'] },
        { id: 'PO3', text: 'Evaluating safety protocols and environmental impact of power setups.', mappedGAs: ['GA-E4'] },
        { id: 'PO4', text: 'Leading multi-disciplinary engineering projects under stringent timelines.', mappedGAs: ['GA-E2', 'GA-E4'] }
      ]
    },
    {
      id: 'be_ce',
      name: 'Bachelor of Engineering in Computer Engineering',
      code: 'BECE',
      departmentId: 'engineering',
      pos: [
        { id: 'PO1', text: 'Developing firmware and high-performance microprocessor architectures.', mappedGAs: ['GA-E1', 'GA-E3'] },
        { id: 'PO2', text: 'Co-designing hardware and software systems for automated IoT systems.', mappedGAs: ['GA-E2', 'GA-E3'] },
        { id: 'PO3', text: 'Troubleshooting integrated electronic circuits with modern laboratory instrumentation.', mappedGAs: ['GA-E3'] },
        { id: 'PO4', text: 'Adhering to professional norms and global technical regulations.', mappedGAs: ['GA-E4'] }
      ]
    },
    {
      id: 'be_civ',
      name: 'Bachelor of Engineering in Civil Engineering',
      code: 'BECIV',
      departmentId: 'engineering',
      pos: [
        { id: 'PO1', text: 'Analyzing structural integrity and safety standards for infrastructure project plans.', mappedGAs: ['GA-E1', 'GA-E2'] },
        { id: 'PO2', text: 'Implementing advanced geotech and hydraulics modeling solutions.', mappedGAs: ['GA-E2', 'GA-E3'] },
        { id: 'PO3', text: 'Pioneering sustainable smart city structures and eco-friendly building materials.', mappedGAs: ['GA-E4'] },
        { id: 'PO4', text: 'Managing municipal budgets and public resource allocations.', mappedGAs: ['GA-E2'] }
      ]
    },

    // Media Department Programs (BSMS, BSDM, MSJR)
    {
      id: 'bs_ms',
      name: 'Bachelor of Science in Media Studies',
      code: 'BSMS',
      departmentId: 'media',
      pos: [
        { id: 'PO1', text: 'Comprehending historical theories of media consumption and social discourse.', mappedGAs: ['GA-M1'] },
        { id: 'PO2', text: 'Mastering advanced film production, screenwriting, and cinematic lighting.', mappedGAs: ['GA-M2', 'GA-M3'] },
        { id: 'PO3', text: 'Critically analyzing television formats and broadcast guidelines.', mappedGAs: ['GA-M1', 'GA-M4'] },
        { id: 'PO4', text: 'Managing multi-cam productions and digital media editing workflows.', mappedGAs: ['GA-M3'] }
      ]
    },
    {
      id: 'bs_dm',
      name: 'Bachelor of Science in Digital Marketing',
      code: 'BSDM',
      departmentId: 'media',
      pos: [
        { id: 'PO1', text: 'Formulating conversion rate optimization funnels and multi-channel ad campaigns.', mappedGAs: ['GA-M1', 'GA-M3'] },
        { id: 'PO2', text: 'Leveraging SEO algorithms and data analytics to optimize web presence.', mappedGAs: ['GA-M2', 'GA-M3'] },
        { id: 'PO3', text: 'Designing professional social media content and brand voice systems.', mappedGAs: ['GA-M3'] },
        { id: 'PO4', text: 'Exercising consumer rights compliance and ethical ad placement strategies.', mappedGAs: ['GA-M4'] }
      ]
    },
    {
      id: 'ms_jr',
      name: 'Master of Science in Journalism',
      code: 'MSJR',
      departmentId: 'media',
      pos: [
        { id: 'PO1', text: 'Executing high-impact investigative journalism projects in complex environments.', mappedGAs: ['GA-M1', 'GA-M2'] },
        { id: 'PO2', text: 'Demonstrating complete commitment to editorial truthfulness and legal protection.', mappedGAs: ['GA-M4'] },
        { id: 'PO3', text: 'Mastering mobile journalism and real-time live reporting procedures.', mappedGAs: ['GA-M3'] },
        { id: 'PO4', text: 'Analyzing global news syndicates and geostrategic news framing models.', mappedGAs: ['GA-M1'] }
      ]
    },

    // Health Department Programs (DPT, BSN, BSBT)
    {
      id: 'dpt',
      name: 'Doctor of Physical Therapy',
      code: 'DPT',
      departmentId: 'health',
      pos: [
        { id: 'PO1', text: 'Executing comprehensive musculoskeletal diagnostic examinations.', mappedGAs: ['GA-H1', 'GA-H2'] },
        { id: 'PO2', text: 'Designing customized physical rehabilitation regimens for diverse populations.', mappedGAs: ['GA-H2', 'GA-H3'] },
        { id: 'PO3', text: 'Upholding patient confidentiality and professional clinical ethics.', mappedGAs: ['GA-H4'] },
        { id: 'PO4', text: 'Collaborating in inter-professional healthcare units.', mappedGAs: ['GA-H2'] }
      ]
    },
    {
      id: 'bs_n',
      name: 'Bachelor of Science in Nursing',
      code: 'BSN',
      departmentId: 'health',
      pos: [
        { id: 'PO1', text: 'Delivering holistic clinical nursing care in intensive situations.', mappedGAs: ['GA-H1', 'GA-H2'] },
        { id: 'PO2', text: 'Administering life-saving pharmacological interventions accurately.', mappedGAs: ['GA-H3'] },
        { id: 'PO3', text: 'Acting as an empathetic health advocate for underserved demographic units.', mappedGAs: ['GA-H4'] },
        { id: 'PO4', text: 'Managing sterile ward operations and emergency triage guidelines.', mappedGAs: ['GA-H2', 'GA-H3'] }
      ]
    },
    {
      id: 'bs_bt',
      name: 'Bachelor of Science in Biotechnology',
      code: 'BSBT',
      departmentId: 'health',
      pos: [
        { id: 'PO1', text: 'Isolating nucleic acids and executing advanced PCR procedures.', mappedGAs: ['GA-H1', 'GA-H3'] },
        { id: 'PO2', text: 'Manipulating recombinant DNA systems for vaccine development.', mappedGAs: ['GA-H2', 'GA-H3'] },
        { id: 'PO3', text: 'Evaluating chemical biohazards and clinical biosafety levels.', mappedGAs: ['GA-H4'] },
        { id: 'PO4', text: 'Interpreting complex bio-informatics data sequences.', mappedGAs: ['GA-H2'] }
      ]
    }
  ],
  gas: [
    // Computing Department GAs
    { id: 'GA-1', name: 'Academic Education', description: 'Completion of an accredited program of study designed to prepare graduates as computing professionals.', departmentId: 'computing' },
    { id: 'GA-2', name: 'Knowledge for Solving Computing Problems', description: 'Apply knowledge of computing fundamentals.', departmentId: 'computing' },
    { id: 'GA-3', name: 'Problem Analysis', description: 'Identify and solve complex computing problems.', departmentId: 'computing' },
    { id: 'GA-4', name: 'Design/Development of Solutions', description: 'Design and evaluate solutions for complex computing problems.', departmentId: 'computing' },
    { id: 'GA-5', name: 'Modern Tool Usage', description: 'Create, select, or adapt and then apply appropriate modern computing tools.', departmentId: 'computing' },
    { id: 'GA-6', name: 'Individual and Team Work', description: 'Function effectively as an individual and as a member or leader of a team.', departmentId: 'computing' },
    { id: 'GA-7', name: 'Communication', description: 'Communicate effectively with the computing community.', departmentId: 'computing' },
    { id: 'GA-8', name: 'Computing Professionalism and Society', description: 'Understand and assess societal, health, safety, legal, and cultural issues.', departmentId: 'computing' },
    { id: 'GA-9', name: 'Ethics', description: 'Understand and commit to professional ethics.', departmentId: 'computing' },
    { id: 'GA-10', name: 'Life-long Learning', description: 'Engage in independent learning for continual development.', departmentId: 'computing' },

    // Business Department GAs
    { id: 'GA-B1', name: 'Business Analytics & Decision Making', description: 'Execute comprehensive business analysis.', departmentId: 'business' },
    { id: 'GA-B2', name: 'Leadership & Teamwork', description: 'Foster strong collaborative performance.', departmentId: 'business' },
    { id: 'GA-B3', name: 'Strategic Thinking', description: 'Synthesize market trends to deploy agile business vision.', departmentId: 'business' },
    { id: 'GA-B4', name: 'Financial Literacy', description: 'Evaluate balance sheets and financial statements.', departmentId: 'business' },
    { id: 'GA-B5', name: 'Corporate Social Responsibility & Ethics', description: 'Demonstrate deep compliance and transparency.', departmentId: 'business' },
    { id: 'GA-B6', name: 'Communication & Presenting', description: 'Deliver highly structured business communications.', departmentId: 'business' },
    { id: 'GA-B7', name: 'Critical Advisory', description: 'Troubleshoot complex business cases.', departmentId: 'business' },
    { id: 'GA-B8', name: 'Business Enterprise', description: 'Exhibit high entrepreneurial alertness.', departmentId: 'business' },

    // Engineering Department GAs
    { id: 'GA-E1', name: 'Engineering Knowledge', description: 'Apply mathematics, science, and engineering fundamentals.', departmentId: 'engineering' },
    { id: 'GA-E2', name: 'Design & Investigation', description: 'Formulate system parameters and conduct valid experiment designs.', departmentId: 'engineering' },
    { id: 'GA-E3', name: 'Modern Engineering Tools', description: 'Deploy state-of-the-art computational simulation designs.', departmentId: 'engineering' },
    { id: 'GA-E4', name: 'Ethics & Environment', description: 'Mitigate ecological hazards and adhere to professional codes.', departmentId: 'engineering' },

    // Media Department GAs
    { id: 'GA-M1', name: 'Media Literacy', description: 'Analyze structural paradigms in mass communication streams.', departmentId: 'media' },
    { id: 'GA-M2', name: 'Content Strategy', description: 'Optimize user attention dynamics and narrative engagement loops.', departmentId: 'media' },
    { id: 'GA-M3', name: 'Digital Tools Production', description: 'Design premium multimedia vectors and software configurations.', departmentId: 'media' },
    { id: 'GA-M4', name: 'Acoustic & Media Ethics', description: 'Defend journalism integrity standards.', departmentId: 'media' },

    // Health Department GAs
    { id: 'GA-H1', name: 'Medical Knowledge', description: 'Demonstrate rigorous understanding of biological mechanics.', departmentId: 'health' },
    { id: 'GA-H2', name: 'Clinical Excellence', description: 'Perform diagnostic inquiries and execute treatment designs safely.', departmentId: 'health' },
    { id: 'GA-H3', name: 'Scientific Research', description: 'Formulate bio-informatics queries and test chemical hypotheses.', departmentId: 'health' },
    { id: 'GA-H4', name: 'Bioethics & Patient Advocacy', description: 'Enforce patient rights and medical ethics codes.', departmentId: 'health' }
  ],
  courses: [
    // 37 BSCS Core Courses + 7 Electives (Total 44 as shown exactly in photos!)
    { id: 'C1', code: 'CMC111', title: 'Programming Fundamentals', type: 'core', mappedGAs: ['GA-1', 'GA-2', 'GA-4'], departmentId: 'computing' },
    { id: 'C2', code: 'GER111', title: 'Application of Information & Communication Technologies', type: 'core', mappedGAs: ['GA-1', 'GA-2', 'GA-5'], departmentId: 'computing' },
    { id: 'C3', code: 'GER121', title: 'Functional English', type: 'core', mappedGAs: ['GA-1', 'GA-7'], departmentId: 'computing' },
    { id: 'C4', code: 'GER131', title: 'Calculus and Analytic Geometry', type: 'core', mappedGAs: ['GA-1', 'GA-2', 'GA-3'], departmentId: 'computing' },
    { id: 'C5', code: 'GER141', title: 'Islamic Studies', type: 'core', mappedGAs: ['GA-1', 'GA-6', 'GA-8', 'GA-9'], departmentId: 'computing' },
    { id: 'C6', code: 'GER151', title: 'Natural Science (Applied Physics)', type: 'core', mappedGAs: ['GA-1', 'GA-2'], departmentId: 'computing' },
    { id: 'C7', code: 'MTE111', title: 'Multivariable Calculus', type: 'core', mappedGAs: ['GA-1', 'GA-2', 'GA-3'], departmentId: 'computing' },
    { id: 'C8', code: 'CMC112', title: 'Object Oriented Programming', type: 'core', mappedGAs: ['GA-1', 'GA-2', 'GA-4'], departmentId: 'computing' },
    { id: 'C9', code: 'CMC121', title: 'Digital Logic Design', type: 'core', mappedGAs: ['GA-1', 'GA-2', 'GA-3'], departmentId: 'computing' },
    { id: 'C10', code: 'GER122', title: 'Expository Writing', type: 'core', mappedGAs: ['GA-1', 'GA-6', 'GA-7'], departmentId: 'computing' },
    { id: 'C11', code: 'GER132', title: 'Discrete Structures', type: 'core', mappedGAs: ['GA-1', 'GA-2', 'GA-3'], departmentId: 'computing' },
    { id: 'C12', code: 'GER142', title: 'Ideology and Constitution of Pakistan', type: 'core', mappedGAs: ['GA-1', 'GA-8', 'GA-9', 'GA-10'], departmentId: 'computing' },
    { id: 'C13', code: 'MTE212', title: 'Probability & Statistics', type: 'core', mappedGAs: ['GA-1', 'GA-2', 'GA-3'], departmentId: 'computing' },
    { id: 'C14', code: 'CMC222', title: 'Computer Organization & Assembly Language', type: 'core', mappedGAs: ['GA-1', 'GA-2', 'GA-3'], departmentId: 'computing' },
    { id: 'C15', code: 'CMC251', title: 'Data Structures', type: 'core', mappedGAs: ['GA-1', 'GA-2', 'GA-3', 'GA-5'], departmentId: 'computing' },
    { id: 'C16', code: 'CSC252', title: 'Theory of Automata', type: 'core', mappedGAs: ['GA-1', 'GA-2', 'GA-3', 'GA-4'], departmentId: 'computing' },
    { id: 'C17', code: 'CMC261', title: 'Computer Networks', type: 'core', mappedGAs: ['GA-1', 'GA-2', 'GA-3'], departmentId: 'computing' },
    { id: 'C18', code: 'MTE213', title: 'Linear Algebra', type: 'core', mappedGAs: ['GA-1', 'GA-2', 'GA-3'], departmentId: 'computing' },
    { id: 'C19', code: 'MTE221', title: 'Technical & Business Writing', type: 'core', mappedGAs: ['GA-1', 'GA-6', 'GA-8'], departmentId: 'computing' },
    { id: 'C20', code: 'CSC223', title: 'Computer Architecture', type: 'core', mappedGAs: ['GA-1', 'GA-2', 'GA-5'], departmentId: 'computing' },
    { id: 'C21', code: 'CMC241', title: 'Operating Systems', type: 'core', mappedGAs: ['GA-1', 'GA-2', 'GA-3'], departmentId: 'computing' },
    { id: 'C22', code: 'CMC253', title: 'Analysis of Algorithms', type: 'core', mappedGAs: ['GA-1', 'GA-2', 'GA-3', 'GA-4'], departmentId: 'computing' },
    { id: 'C23', code: 'GER261', title: 'Introduction to Management', type: 'core', mappedGAs: ['GA-1', 'GA-3', 'GA-6'], departmentId: 'computing' },
    { id: 'C24', code: 'CMC331', title: 'Database Systems', type: 'core', mappedGAs: ['GA-1', 'GA-2', 'GA-3', 'GA-5'], departmentId: 'computing' },
    { id: 'C25', code: 'CSC354', title: 'Compiler Construction', type: 'core', mappedGAs: ['GA-1', 'GA-2', 'GA-3', 'GA-4'], departmentId: 'computing' },
    { id: 'C26', code: 'CMC362', title: 'Information Security', type: 'core', mappedGAs: ['GA-1', 'GA-2', 'GA-3', 'GA-4'], departmentId: 'computing' },
    { id: 'C27', code: 'CMC371', title: 'Software Engineering', type: 'core', mappedGAs: ['GA-1', 'GA-2', 'GA-3'], departmentId: 'computing' },
    { id: 'C28', code: 'CSC332', title: 'Advance Database Management Systems', type: 'core', mappedGAs: ['GA-1', 'GA-2', 'GA-3', 'GA-5'], departmentId: 'computing' },
    { id: 'C29', code: 'CMC381', title: 'Artificial Intelligence', type: 'core', mappedGAs: ['GA-1', 'GA-2', 'GA-3', 'GA-4', 'GA-5'], departmentId: 'computing' },
    { id: 'C30', code: 'CSC382', title: 'HCI & Computer Graphics', type: 'core', mappedGAs: ['GA-1', 'GA-3', 'GA-4', 'GA-5'], departmentId: 'computing' },
    { id: 'C31', code: 'ESC311', title: 'Introduction to Marketing', type: 'core', mappedGAs: ['GA-1', 'GA-7', 'GA-8', 'GA-9'], departmentId: 'computing' },
    { id: 'C32', code: 'CSC442', title: 'Parallel & Distributed Computing', type: 'core', mappedGAs: ['GA-1', 'GA-2', 'GA-4', 'GA-5'], departmentId: 'computing' },
    { id: 'C33', code: 'GER462', title: 'Technopreneurship', type: 'core', mappedGAs: ['GA-1', 'GA-7', 'GA-9', 'GA-10'], departmentId: 'computing' },
    { id: 'C34', code: 'CMC491', title: 'Final Year Project - I', type: 'core', mappedGAs: ['GA-1'], departmentId: 'computing' },
    { id: 'C35', code: 'GER443', title: 'Civics and Community Engagement', type: 'core', mappedGAs: ['GA-1', 'GA-7', 'GA-8', 'GA-9'], departmentId: 'computing' },
    { id: 'C36', code: 'GER463', title: 'Professional Practices', type: 'core', mappedGAs: ['GA-1', 'GA-8', 'GA-9', 'GA-10'], departmentId: 'computing' },
    { id: 'C37', code: 'CMC492', title: 'Final Year Project - II', type: 'core', mappedGAs: ['GA-1', 'GA-2', 'GA-3', 'GA-4', 'GA-5', 'GA-6', 'GA-7', 'GA-8', 'GA-9', 'GA-10'], departmentId: 'computing' },
    
    // Electives
    { id: 'C38', code: 'CSC467', title: 'Internet of Things', type: 'elective', mappedGAs: ['GA-1', 'GA-2', 'GA-3', 'GA-4'], departmentId: 'computing' },
    { id: 'C39', code: 'CMC381-E', title: 'Artificial Intelligence (Elective)', type: 'elective', mappedGAs: ['GA-1', 'GA-2', 'GA-4', 'GA-5'], departmentId: 'computing' },
    { id: 'C40', code: 'CSC436', title: 'Data Warehousing & Data Mining', type: 'elective', mappedGAs: ['GA-1', 'GA-2', 'GA-3', 'GA-7', 'GA-10'], departmentId: 'computing' },
    { id: 'C41', code: 'CSC479', title: 'Machine Learning', type: 'elective', mappedGAs: ['GA-1', 'GA-2', 'GA-4', 'GA-5'], departmentId: 'computing' },
    { id: 'C42', code: 'CSC435', title: 'Mobile Application Development', type: 'elective', mappedGAs: ['GA-1', 'GA-2', 'GA-3'], departmentId: 'computing' },
    { id: 'C43', code: 'CSC321', title: 'Embedded Systems', type: 'elective', mappedGAs: ['GA-1', 'GA-2', 'GA-5'], departmentId: 'computing' },
    { id: 'C44', code: 'CSC478', title: 'Routing and Switching', type: 'elective', mappedGAs: ['GA-1', 'GA-2', 'GA-3', 'GA-4'], departmentId: 'computing' },

    // BSAI Core & Elective Courses
    { id: 'C45', code: 'AIC211', title: 'Artificial Intelligence', type: 'core', mappedGAs: ['GA-1', 'GA-2', 'GA-4', 'GA-5'], departmentId: 'computing' },
    { id: 'C46', code: 'AIC212', title: 'Programming For AI', type: 'core', mappedGAs: ['GA-1', 'GA-2', 'GA-4', 'GA-5'], departmentId: 'computing' },
    { id: 'C47', code: 'CMC252', title: 'Analysis of Algorithms', type: 'core', mappedGAs: ['GA-1', 'GA-2', 'GA-3', 'GA-4'], departmentId: 'computing' },
    { id: 'C48', code: 'AIC221', title: 'Introduction to Machine Learning', type: 'core', mappedGAs: ['GA-1', 'GA-2', 'GA-3', 'GA-4', 'GA-5'], departmentId: 'computing' },
    { id: 'C49', code: 'AIC323', title: 'Artificial Neural Network & Deep Learning', type: 'core', mappedGAs: ['GA-1', 'GA-3', 'GA-4', 'GA-5'], departmentId: 'computing' },
    { id: 'C50', code: 'AIE423', title: 'Computer vision', type: 'core', mappedGAs: ['GA-1', 'GA-2', 'GA-4'], departmentId: 'computing' },
    { id: 'C51', code: 'AIC331', title: 'Knowledge Representation & Reasoning', type: 'core', mappedGAs: ['GA-1', 'GA-2', 'GA-3', 'GA-4'], departmentId: 'computing' },
    { id: 'C52', code: 'AIE441', title: 'Natural Language Processing', type: 'elective', mappedGAs: ['GA-1', 'GA-2', 'GA-4', 'GA-5'], departmentId: 'computing' },
    { id: 'C53', code: 'CSE384', title: 'Data Science', type: 'elective', mappedGAs: ['GA-1', 'GA-2', 'GA-7'], departmentId: 'computing' },
    { id: 'C54', code: 'SEN352', title: 'HCI & Computer Graphics', type: 'elective', mappedGAs: ['GA-1', 'GA-3', 'GA-4'], departmentId: 'computing' },
    { id: 'C55', code: 'AINX7X', title: 'Image Processing & Analysis', type: 'elective', mappedGAs: ['GA-1', 'GA-2', 'GA-4'], departmentId: 'computing' },
    { id: 'C56', code: 'AIE341', title: 'Deep Learning', type: 'elective', mappedGAs: ['GA-1', 'GA-2', 'GA-3', 'GA-4'], departmentId: 'computing' },
    { id: 'C57', code: 'AINX7X', title: 'Big Data', type: 'elective', mappedGAs: ['GA-1', 'GA-2', 'GA-3', 'GA-4'], departmentId: 'computing' },
    { id: 'C58', code: 'AINX7X', title: 'Artificial Intelligence For Robotics', type: 'elective', mappedGAs: ['GA-1', 'GA-2', 'GA-3', 'GA-4'], departmentId: 'computing' },

    // Business Department Courses (BBA)
    { id: 'CB1', code: 'BUS101', title: 'Principles of Management', type: 'core', mappedGAs: ['GA-B2', 'GA-B3', 'GA-B6'], departmentId: 'business' },
    { id: 'CB2', code: 'MKT111', title: 'Principles of Marketing', type: 'core', mappedGAs: ['GA-B3', 'GA-B6', 'GA-B8'], departmentId: 'business' },
    { id: 'CB3', code: 'ACC121', title: 'Financial Accounting', type: 'core', mappedGAs: ['GA-B1', 'GA-B4'], departmentId: 'business' },
    { id: 'CB4', code: 'HRM211', title: 'Human Resource Management', type: 'core', mappedGAs: ['GA-B2', 'GA-B5', 'GA-B6'], departmentId: 'business' },
    { id: 'CB5', code: 'ECO131', title: 'Microeconomics', type: 'core', mappedGAs: ['GA-B1', 'GA-B3'], departmentId: 'business' },
    { id: 'CB6', code: 'MGT222', title: 'Organizational Behavior', type: 'core', mappedGAs: ['GA-B2', 'GA-B5', 'GA-B6'], departmentId: 'business' },
    { id: 'CB7', code: 'FIN311', title: 'Business Finance', type: 'core', mappedGAs: ['GA-B1', 'GA-B4'], departmentId: 'business' },
    { id: 'CB8', code: 'MGT331', title: 'Strategic Management', type: 'core', mappedGAs: ['GA-B3', 'GA-B5', 'GA-B7', 'GA-B8'], departmentId: 'business' },
    { id: 'CB9', code: 'BUS491', title: 'BBA Capstone Project - I', type: 'core', mappedGAs: ['GA-B1', 'GA-B2', 'GA-B3', 'GA-B6'], departmentId: 'business' },
    { id: 'CB10', code: 'BUS492', title: 'BBA Capstone Project - II', type: 'core', mappedGAs: ['GA-B1', 'GA-B2', 'GA-B3', 'GA-B4', 'GA-B5', 'GA-B6', 'GA-B7', 'GA-B8'], departmentId: 'business' },
    { id: 'CB11', code: 'ENTR451', title: 'Social Entrepreneurship', type: 'elective', mappedGAs: ['GA-B5', 'GA-B8'], departmentId: 'business' },
    { id: 'CB12', code: 'FIN462', title: 'Investment Portfolio Analysis', type: 'elective', mappedGAs: ['GA-B1', 'GA-B4', 'GA-B7'], departmentId: 'business' }
  ]
};

// Lazy initialization helper for localStorage DB
const getLocalStorageData = (): OBEData => {
  const dataStr = localStorage.getItem('IQRA_OBE_FALLBACK_DB');
  if (dataStr) {
    try {
      const parsed = JSON.parse(dataStr);
      let migrated = false;

      // Force reset or migrate departments if they have old dataset
      const hasBsai = parsed.programs && parsed.programs.some((p: any) => p.id === 'bsai');
      if (!parsed.departments || parsed.departments.length < 5 || !hasBsai) {
        parsed.departments = DEFAULT_FALLBACK_DATA.departments;
        parsed.programs = DEFAULT_FALLBACK_DATA.programs;
        parsed.gas = DEFAULT_FALLBACK_DATA.gas;
        parsed.courses = DEFAULT_FALLBACK_DATA.courses;
        migrated = true;
      }

      if (Array.isArray(parsed.courses)) {
        parsed.courses = parsed.courses.map((c: any) => {
          if (c.departmentId === 'computing' && !c.programId) {
            migrated = true;
            return { ...c, programId: 'bscs' };
          }
          return c;
        });
      }
      if (Array.isArray(parsed.gas) && parsed.gas.length > 0 && parsed.departments && parsed.departments.length >= 5) {
        // Ensure GAs are migrated/present for all departments
        const hasEngineeringGAs = parsed.gas.some((g: any) => g.departmentId === 'engineering');
        if (!hasEngineeringGAs) {
          parsed.gas = DEFAULT_FALLBACK_DATA.gas;
          migrated = true;
        }
      } else {
        migrated = true;
        parsed.gas = DEFAULT_FALLBACK_DATA.gas.map(g => {
          if (g.departmentId === 'computing') return { ...g, programId: 'bscs' };
          if (g.departmentId === 'business') return { ...g, programId: 'bba' };
          return g;
        });
      }
      if (Array.isArray(parsed.programs)) {
        parsed.programs = parsed.programs.map((p: any) => {
          if (p.id === 'bscs') {
            if (!p.vision) {
              migrated = true;
              p.vision = 'To produce computer science graduates of international standards with state-of-the-art skills.';
            }
            if (!p.mission) {
              migrated = true;
              p.mission = 'To empower students with deep scientific computer knowledge, preparing them for leading-edge industry roles.';
            }
          }
          return p;
        });
      }
      if (migrated) {
        localStorage.setItem('IQRA_OBE_FALLBACK_DB', JSON.stringify(parsed));
      }
      
      return parsed;
    } catch (e) {
      console.error("Failed to parse local storage fallback, resetting to default.", e);
    }
  }

  const base = { ...DEFAULT_FALLBACK_DATA };
  base.courses = base.courses.map(c => {
    if (c.departmentId === 'computing' && !c.programId) {
      return { ...c, programId: 'bscs' };
    }
    return c;
  });
  base.gas = base.gas.map(g => {
    if (g.departmentId === 'computing') {
      return { ...g, programId: 'bscs' };
    }
    if (g.departmentId === 'business') {
      return { ...g, programId: 'bba' };
    }
    return g;
  });
  base.programs = base.programs.map(p => {
    if (p.id === 'bscs') {
      return {
        ...p,
        vision: 'To produce computer science graduates of international standards with state-of-the-art skills.',
        mission: 'To empower students with deep scientific computer knowledge, preparing them for leading-edge industry roles.'
      };
    }
    return p;
  });

  localStorage.setItem('IQRA_OBE_FALLBACK_DB', JSON.stringify(base));
  
  return base;
};

const saveLocalStorageData = (data: OBEData) => {
  localStorage.setItem('IQRA_OBE_FALLBACK_DB', JSON.stringify(data));
};

const getHeaders = () => {
  const token = localStorage.getItem('access');
  return {
    'Content-Type': 'application/json',
    ...(token ? { 'Authorization': `Bearer ${token}` } : {}),
  };
};

let isRefreshing = false;
let refreshSubscribers: ((token: string) => void)[] = [];

const subscribeTokenRefresh = (cb: (token: string) => void) => {
  refreshSubscribers.push(cb);
};

const onRefreshed = (token: string) => {
  refreshSubscribers.forEach(cb => cb(token));
  refreshSubscribers = [];
};

const refreshAccessToken = async (): Promise<string | null> => {
  const refreshToken = localStorage.getItem('refresh');
  if (!refreshToken) return null;

  const endpoints = [
    `${BASE_URL}/auth/token/refresh/`,
    `${BASE_URL}/auth/refresh/`,
    `${BASE_URL}/token/refresh/`
  ];
  for (const url of endpoints) {
    try {
      const res = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ refresh: refreshToken }),
      });
      if (res.ok) {
        const data = await res.json();
        if (data.access) {
          // SECURITY NOTE: Storing JWT tokens in localStorage is susceptible to XSS.
          // For production hardening, transition to using secure, httpOnly cookies set by the backend.
          localStorage.setItem('access', data.access);
          return data.access;
        }
      }
    } catch (e) {
      console.warn(`Token refresh failed on endpoint ${url}:`, e);
    }
  }
  return null;
};

const fetchWithTimeout = async (url: string, options: RequestInit = {}, timeoutMs = 15000): Promise<Response> => {
  // If previously marked offline, try with a short timeout to probe and potentially recover
  const wasOffline = localStorage.getItem('backend_offline') === 'true';
  const effectiveTimeout = wasOffline ? 2500 : timeoutMs;

  // Security Interceptor: Block authenticated requests if the user must change their default password
  const savedUserStr = localStorage.getItem('IQRA_OBE_LOGGED_IN_USER');
  if (savedUserStr) {
    try {
      const user = JSON.parse(savedUserStr);
      if (user && user.mustChangePassword && !url.includes('/auth/change-password') && !url.includes('/auth/login') && !url.includes('/auth/token/refresh')) {
        window.dispatchEvent(new CustomEvent('session-expired'));
        throw new Error('You must change your default password before accessing any application features.');
      }
    } catch (e) {}
  }

  const makeRequest = async (tokenOverride?: string) => {
    const controller = new AbortController();
    const id = setTimeout(() => controller.abort(), effectiveTimeout);
    try {
      let reqOptions = { ...options };
      if (tokenOverride) {
        reqOptions.headers = {
          ...reqOptions.headers,
          'Authorization': `Bearer ${tokenOverride}`
        };
      } else {
        // Always make sure headers are fresh when retrying or starting
        reqOptions.headers = {
          ...getHeaders(),
          ...options.headers
        };
      }
      const response = await fetch(url, {
        ...reqOptions,
        signal: controller.signal,
      });
      clearTimeout(id);

      // On success, recover online status
      if (response.ok) {
        if (localStorage.getItem('backend_offline') === 'true') {
          localStorage.setItem('backend_offline', 'false');
          window.dispatchEvent(new CustomEvent('backend-online-detected'));
        }
      }

      return response;
    } catch (error) {
      clearTimeout(id);

      // On network failure or timeout, ensure offline status is flagged
      if (localStorage.getItem('backend_offline') !== 'true') {
        localStorage.setItem('backend_offline', 'true');
        window.dispatchEvent(new CustomEvent('backend-offline-detected'));
      }

      throw error;
    }
  };

  let response = await makeRequest();

  // If unauthorized (401), try token refresh once
  if (response.status === 401 && !url.includes('/auth/login') && !url.includes('/refresh')) {
    const refreshToken = localStorage.getItem('refresh');
    if (refreshToken) {
      if (!isRefreshing) {
        isRefreshing = true;
        const newAccessToken = await refreshAccessToken();
        isRefreshing = false;
        onRefreshed(newAccessToken || '');
      }

      if (isRefreshing) {
        // Wait for refresh to complete
        const refreshedToken = await new Promise<string>((resolve) => {
          subscribeTokenRefresh((token) => resolve(token));
        });
        if (refreshedToken) {
          response = await makeRequest(refreshedToken);
        }
      } else {
        const storedToken = localStorage.getItem('access');
        if (storedToken) {
          response = await makeRequest(storedToken);
        }
      }
    }
  }

  // If Forbidden (403), check if it's due to required password change
  if (response.status === 403 && !url.includes('/auth/login')) {
    try {
      const clonedRes = response.clone();
      const body = await clonedRes.json();
      if (body && (body.detail?.toLowerCase().includes('password change') || body.detail?.toLowerCase().includes('must_change_password') || body.detail?.toLowerCase().includes('password_change'))) {
        const savedUserStr = localStorage.getItem('IQRA_OBE_LOGGED_IN_USER');
        if (savedUserStr) {
          try {
            const user = JSON.parse(savedUserStr);
            user.mustChangePassword = true;
            localStorage.setItem('IQRA_OBE_LOGGED_IN_USER', JSON.stringify(user));
          } catch (e) {}
        }
        window.dispatchEvent(new CustomEvent('session-expired', { detail: { isPasswordReset: true } }));
      }
    } catch (e) {}
  }

  // If STILL unauthorized (401), trigger session expiration to alert user and logout gracefully
  if (response.status === 401 && !url.includes('/auth/login') && !url.includes('/refresh')) {
    window.dispatchEvent(new CustomEvent('session-expired'));
  }

  return response;
};

export const apiService = {
  async checkHealth(): Promise<boolean> {
    try {
      const controller = new AbortController();
      const id = setTimeout(() => controller.abort(), 3000);
      const response = await fetch(`${BASE_URL}/health/`, {
        signal: controller.signal,
        headers: { 'Accept': 'application/json' }
      });
      clearTimeout(id);
      return response.ok;
    } catch (e) {
      return false;
    }
  },

  async getAllData(): Promise<OBEData> {
    try {
      const [depts, programs, gas, courses] = await Promise.all([
        fetchWithTimeout(`${BASE_URL}/departments/`, { headers: getHeaders() }).then(res => res.json()),
        fetchWithTimeout(`${BASE_URL}/programs/`, { headers: getHeaders() }).then(res => res.json()),
        fetchWithTimeout(`${BASE_URL}/gas/`, { headers: getHeaders() }).then(res => res.json()),
        fetchWithTimeout(`${BASE_URL}/courses/`, { headers: getHeaders() }).then(res => res.json()).catch(() => [])
      ]);

      // If backend replies with malformed details or empty arrays, let's gracefully fall back to local storage
      if (!Array.isArray(depts) || depts.length === 0) {
        throw new Error('Malformed or empty departments returned from backend');
      }

      const fallbackCourses = getLocalStorageData().courses;
      const mergedCourses = Array.isArray(courses) && courses.length > 0 ? courses : fallbackCourses;

      return {
        departments: depts || [],
        programs: programs || [],
        gas: gas || [],
        courses: mergedCourses || [],
      };
    } catch (err) {
      console.warn("Backend servers offline or unreachable. Propagating error to UI loader.", err);
      throw err;
    }
  },

  async updateDepartment(id: string, data: Partial<Department>): Promise<Department> {
    try {
      const response = await fetchWithTimeout(`${BASE_URL}/departments/${id}/`, {
        method: 'PATCH',
        headers: getHeaders(),
        body: JSON.stringify(data),
      }, 8000);
      if (!response.ok) throw new Error('Failed to update department on server');
      return response.json();
    } catch (err) {
      console.warn("Saving department changes strictly in client-side storage (mock fallback active).");
      const localData = getLocalStorageData();
      const updatedDepts = localData.departments.map(d => {
        if (d.id === id) {
          return { ...d, ...data };
        }
        return d;
      });
      const updatedLocalData = { ...localData, departments: updatedDepts };
      saveLocalStorageData(updatedLocalData);
      return updatedDepts.find(d => d.id === id)!;
    }
  },

  async updateProgram(id: string, data: Partial<Program>): Promise<Program> {
    try {
      const response = await fetchWithTimeout(`${BASE_URL}/programs/${id}/`, {
        method: 'PATCH',
        headers: getHeaders(),
        body: JSON.stringify(data),
      }, 8000);
      if (!response.ok) throw new Error('Failed to update program on server');
      return response.json();
    } catch (err) {
      console.warn("Saving program changes strictly in client-side storage (mock fallback active).");
      const localData = getLocalStorageData();
      const updatedPrograms = localData.programs.map(p => {
        if (p.id === id) {
          return { ...p, ...data };
        }
        return p;
      });
      const updatedLocalData = { ...localData, programs: updatedPrograms };
      saveLocalStorageData(updatedLocalData);
      return updatedPrograms.find(p => p.id === id)!;
    }
  },

  // Save Course Mapping (allows updating course to GA tick marks in local storage / server mock fallback!)
  async updateCourse(id: string, data: Partial<Course>): Promise<Course> {
    try {
      const response = await fetchWithTimeout(`${BASE_URL}/courses/${id}/`, {
        method: 'PATCH',
        headers: getHeaders(),
        body: JSON.stringify(data),
      }, 8000);
      if (response.ok) return response.json();
    } catch (err) {
      // Squelch fetch error and update locally
    }
    const localData = getLocalStorageData();
    const updatedCourses = localData.courses.map(c => {
      if (c.id === id) {
        return { ...c, ...data };
      }
      return c;
    });
    const updatedLocalData = { ...localData, courses: updatedCourses };
    saveLocalStorageData(updatedLocalData);
    return updatedCourses.find(c => c.id === id)!;
  },

  async deleteCourse(id: string): Promise<boolean> {
    try {
      const response = await fetchWithTimeout(`${BASE_URL}/courses/${id}/`, {
        method: 'DELETE',
        headers: getHeaders(),
      }, 8000);
      if (response.ok) {
        const localData = getLocalStorageData();
        const updatedCourses = localData.courses.filter(c => c.id !== id);
        saveLocalStorageData({ ...localData, courses: updatedCourses });
        return true;
      }
    } catch (err) {
      console.warn("Backend API for course delete offline. Fallback to local storage.");
    }
    const localData = getLocalStorageData();
    const updatedCourses = localData.courses.filter(c => c.id !== id);
    saveLocalStorageData({ ...localData, courses: updatedCourses });
    return true;
  },

  async createProgram(data: Program, associatedGAs?: GA[]): Promise<Program> {
    try {
      if (associatedGAs && associatedGAs.length > 0) {
        try {
          await Promise.all(associatedGAs.map(async (ga) => {
            await fetchWithTimeout(`${BASE_URL}/gas/`, {
              method: 'POST',
              headers: getHeaders(),
              body: JSON.stringify(ga),
            }, 3000).catch(e => console.warn("Failed to save GA to backend", ga.id, e));
          }));
        } catch (gaErr) {
          console.warn("Failed to batch save GAs to backend", gaErr);
        }
      }

      const response = await fetchWithTimeout(`${BASE_URL}/programs/`, {
        method: 'POST',
        headers: getHeaders(),
        body: JSON.stringify(data),
      }, 8000);
      if (!response.ok) throw new Error('Failed to create program on server');
      const responseData = await response.json();

      const localData = getLocalStorageData();
      const updatedPrograms = [...localData.programs, responseData];
      const updatedGAs = associatedGAs ? [...localData.gas, ...associatedGAs] : localData.gas;
      saveLocalStorageData({ ...localData, programs: updatedPrograms, gas: updatedGAs });

      return responseData;
    } catch (err) {
      console.warn("Creating program on backend failed or timed out. Falling back to local storage.", err);
      const localData = getLocalStorageData();
      const updatedPrograms = [...localData.programs, data];
      const updatedGAs = associatedGAs ? [...localData.gas, ...associatedGAs] : localData.gas;
      saveLocalStorageData({ ...localData, programs: updatedPrograms, gas: updatedGAs });
      return data;
    }
  },

  async createCourse(data: Course): Promise<Course> {
    try {
      const response = await fetchWithTimeout(`${BASE_URL}/courses/`, {
        method: 'POST',
        headers: getHeaders(),
        body: JSON.stringify(data),
      }, 8000);
      if (!response.ok) throw new Error('Failed to create course on server');
      const responseData = await response.json();

      const localData = getLocalStorageData();
      const updatedCourses = [...localData.courses, responseData];
      saveLocalStorageData({ ...localData, courses: updatedCourses });

      return responseData;
    } catch (err) {
      console.warn("Creating course on backend failed or timed out. Falling back to local storage.", err);
      const localData = getLocalStorageData();
      const updatedCourses = [...localData.courses, data];
      saveLocalStorageData({ ...localData, courses: updatedCourses });
      return data;
    }
  },

  getLocalInstructorCourses(): InstructorCourse[] {
    return getLocalInstructorCourses();
  },

  async enrollStudents(courseId: string, students: { regNo: string; name: string }[]): Promise<void> {
    const res = await fetchWithTimeout(`${BASE_URL}/admin/enroll/`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify({ courseId, students }),
    }, 8000);
    if (!res.ok) {
      const errData = await res.json().catch(() => ({}));
      const errMsg = errData.detail || errData.error || errData.message || 'Enrollment sync failed';
      throw new Error(errMsg);
    }
  },

  async deleteInstructorCourse(courseId: string): Promise<boolean> {
    try {
      const res = await fetchWithTimeout(`${BASE_URL}/instructor/courses/${courseId}/`, {
        method: 'DELETE',
        headers: getHeaders(),
      }, 8000);
      return res.ok;
    } catch (e) {
      console.warn('Failed to delete instructor course from backend', e);
      return false;
    }
  },

  getLocalStorageData(): OBEData {
    return getLocalStorageData();
  },

  async getInstructorCourses(): Promise<InstructorCourse[]> {
    try {
      const response = await fetchWithTimeout(`${BASE_URL}/instructor/courses/`, {
        headers: getHeaders(),
      }, 4000);
      if (!response.ok) throw new Error('Failed to fetch instructor courses');
      const data = await response.json();
      if (Array.isArray(data)) return data;
      throw new Error('Malformed instructor courses data received');
    } catch (err) {
      console.warn("Backend API for instructor offline or failed. Propagating error to UI loader.", err);
      throw err;
    }
  },

  async saveInstructorCourses(courses: InstructorCourse[]): Promise<InstructorCourse[]> {
    // Save to local storage first for resilient fallback
    localStorage.setItem('IQRA_OBE_INSTRUCTOR_COURSES', JSON.stringify(courses));
    try {
      const response = await fetchWithTimeout(`${BASE_URL}/instructor/courses/`, {
        method: 'POST',
        headers: getHeaders(),
        body: JSON.stringify({ courses }),
      }, 8000);
      if (response.ok) {
        const data = await response.json();
        if (Array.isArray(data)) return data;
      }
    } catch (err) {
      console.warn("Saving instructor courses to backend failed, synchronized offline instead.", err);
    }
    return courses;
  },

  async getStudents(): Promise<Student[]> {
    const normalizeStudent = (s: any): Student => {
      if (!s) return s;
      return {
        ...s,
        regNo: s.regNo || s.reg_no || '',
        name: s.name || '',
        email: s.email || '',
        departmentId: s.departmentId || s.department_id || s.department || '',
        programId: s.programId || s.program_id || s.program || '',
        batch: s.batch || 'Fall',
        semester: s.semester || '1st'
      };
    };

    try {
      const response = await fetchWithTimeout(`${BASE_URL}/students/`, {
        headers: getHeaders(),
      }, 4000);
      if (response.ok) {
        const data = await response.json();
        if (Array.isArray(data)) {
          const normalized = data.map(normalizeStudent);
          localStorage.setItem('IQRA_OBE_STUDENTS', JSON.stringify(normalized));
          return normalized;
        }
      }
    } catch (err) {
      console.warn("Backend API for students offline. Using local storage instead.");
    }
    const saved = localStorage.getItem('IQRA_OBE_STUDENTS');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        const hasBsai = parsed.some((s: any) => (s.programId === 'bsai' || s.program_id === 'bsai'));
        if (hasBsai) {
          return parsed.map(normalizeStudent);
        }
      } catch (e) {
        // ignore
      }
    }
    const initialStudents: Student[] = [
      { regNo: "012-fa22-22012", name: "Abdur Rehman Khalid", departmentId: "engineering", programId: "be_ce", batch: "Fall", semester: "6th" },
      { regNo: "045-fa22-22045", name: "Wajahat Bine Saif", departmentId: "computing", programId: "bscs", batch: "Fall", semester: "6th" },
      { regNo: "089-fa22-22089", name: "Zayan Ahmed Khan", departmentId: "computing", programId: "bscs", batch: "Fall", semester: "6th" },
      { regNo: "104-fa22-22104", name: "Misha Farooq", departmentId: "computing", programId: "bscs", batch: "Fall", semester: "6th" },
      { regNo: "001-fa23-23001", name: "Aisha Siddiqui", departmentId: "computing", programId: "bsai", batch: "Fall", semester: "4th" },
      { regNo: "002-fa23-23002", name: "Muhammad Ali", departmentId: "computing", programId: "bsai", batch: "Fall", semester: "4th" },
      { regNo: "003-sp24-24003", name: "Zainab Fatima", departmentId: "computing", programId: "bsai", batch: "Spring", semester: "3rd" },
      { regNo: "004-fa24-24004", name: "Hamza Yusuf", departmentId: "computing", programId: "bsai", batch: "Fall", semester: "2nd" }
    ];
    localStorage.setItem('IQRA_OBE_STUDENTS', JSON.stringify(initialStudents));
    return initialStudents;
  },

  async createStudent(student: Student): Promise<Student> {
    const normalizeStudent = (s: any): Student => {
      if (!s) return s;
      return {
        ...s,
        regNo: s.regNo || s.reg_no || '',
        name: s.name || '',
        email: s.email || '',
        departmentId: s.departmentId || s.department_id || s.department || '',
        programId: s.programId || s.program_id || s.program || '',
        batch: s.batch || 'Fall',
        semester: s.semester || '1st'
      };
    };

    const mapToBackend = (s: any) => {
      return {
        reg_no: s.regNo,
        regNo: s.regNo,
        name: s.name,
        email: s.email,
        department_id: s.departmentId,
        departmentId: s.departmentId,
        department: s.departmentId,
        program_id: s.programId,
        programId: s.programId,
        program: s.programId,
        batch: s.batch,
        semester: s.semester
      };
    };

    try {
      const response = await fetchWithTimeout(`${BASE_URL}/students/`, {
        method: 'POST',
        headers: getHeaders(),
        body: JSON.stringify(mapToBackend(student)),
      }, 8000);
      if (response.ok) {
        const data = await response.json();
        const normalizedData = normalizeStudent(data);
        const current = await this.getStudents();
        const updated = [...current.filter(s => s.regNo !== normalizedData.regNo), normalizedData];
        localStorage.setItem('IQRA_OBE_STUDENTS', JSON.stringify(updated));
        return normalizedData;
      }
    } catch (err) {
      console.warn("Backend API for students offline. Adding student to local storage.");
    }
    const current = await this.getStudents();
    const updated = [...current.filter(s => s.regNo !== student.regNo), student];
    localStorage.setItem('IQRA_OBE_STUDENTS', JSON.stringify(updated));
    return student;
  },

  async updateStudent(regNo: string, studentData: Partial<Student>): Promise<Student> {
    const normalizeStudent = (s: any): Student => {
      if (!s) return s;
      return {
        ...s,
        regNo: s.regNo || s.reg_no || '',
        name: s.name || '',
        email: s.email || '',
        departmentId: s.departmentId || s.department_id || s.department || '',
        programId: s.programId || s.program_id || s.program || '',
        batch: s.batch || 'Fall',
        semester: s.semester || '1st'
      };
    };

    const mapToBackend = (s: any) => {
      const mapped: any = {};
      if ('regNo' in s || 'reg_no' in s) {
        mapped.reg_no = s.regNo || s.reg_no;
        mapped.regNo = s.regNo || s.reg_no;
      }
      if ('name' in s) mapped.name = s.name;
      if ('email' in s) mapped.email = s.email;
      if ('departmentId' in s || 'department' in s || 'department_id' in s) {
        const val = s.departmentId || s.department_id || s.department;
        mapped.department_id = val;
        mapped.departmentId = val;
        mapped.department = val;
      }
      if ('programId' in s || 'program' in s || 'program_id' in s) {
        const val = s.programId || s.program_id || s.program;
        mapped.program_id = val;
        mapped.programId = val;
        mapped.program = val;
      }
      if ('batch' in s) mapped.batch = s.batch;
      if ('semester' in s) mapped.semester = s.semester;
      return mapped;
    };

    const currentStudents = await this.getStudents();
    const matchedStudent = currentStudents.find(s => s.regNo.toLowerCase() === regNo.toLowerCase());
    const backendId = matchedStudent ? (matchedStudent as any).id : null;
    const urlSuffix = backendId !== undefined && backendId !== null ? backendId : regNo;

    try {
      const response = await fetchWithTimeout(`${BASE_URL}/students/${urlSuffix}/`, {
        method: 'PATCH',
        headers: getHeaders(),
        body: JSON.stringify(mapToBackend(studentData)),
      }, 8000);
      if (response.ok) {
        const data = await response.json();
        const normalizedData = normalizeStudent(data);
        const current = await this.getStudents();
        const updated = current.map(s => s.regNo === regNo ? { ...s, ...normalizedData } : s);
        localStorage.setItem('IQRA_OBE_STUDENTS', JSON.stringify(updated));
        return normalizedData;
      } else {
        const errorText = await response.text();
        let parsed;
        try { parsed = JSON.parse(errorText); } catch (e) {}
        throw new Error(parsed?.message || parsed?.error || `Server error (${response.status}): ${errorText}`);
      }
    } catch (err: any) {
      if (err.message && (err.message.includes('Server error') || err.message.includes('validation') || err.message.includes('not found') || err.message.includes('Conflict'))) {
        throw err;
      }
      console.warn("Backend API for students offline. Updating student in local storage.", err);
    }
    const current = await this.getStudents();
    const matched = current.find(s => s.regNo === regNo);
    if (!matched) throw new Error("Student not found");
    const updatedStudent = { ...matched, ...studentData };
    const updated = current.map(s => s.regNo === regNo ? updatedStudent : s);
    localStorage.setItem('IQRA_OBE_STUDENTS', JSON.stringify(updated));
    return updatedStudent;
  },

  async deleteStudent(regNo: string): Promise<boolean> {
    const currentStudents = await this.getStudents();
    const matchedStudent = currentStudents.find(s => s.regNo.toLowerCase() === regNo.toLowerCase());
    const backendId = matchedStudent ? (matchedStudent as any).id : null;
    const urlSuffix = backendId !== undefined && backendId !== null ? backendId : regNo;

    try {
      const response = await fetchWithTimeout(`${BASE_URL}/students/${urlSuffix}/`, {
        method: 'DELETE',
        headers: getHeaders(),
      }, 8000);
      if (response.ok) {
        const current = await this.getStudents();
        const updated = current.filter(s => s.regNo !== regNo);
        localStorage.setItem('IQRA_OBE_STUDENTS', JSON.stringify(updated));
        return true;
      } else {
        const errorText = await response.text();
        let parsed;
        try { parsed = JSON.parse(errorText); } catch (e) {}
        throw new Error(parsed?.message || parsed?.error || `Server error (${response.status}): ${errorText}`);
      }
    } catch (err: any) {
      if (err.message && (err.message.includes('Server error') || err.message.includes('validation') || err.message.includes('Conflict'))) {
        throw err;
      }
      console.warn("Backend API for students offline. Deleting student from local storage.", err);
    }
    const current = await this.getStudents();
    const updated = current.filter(s => s.regNo !== regNo);
    localStorage.setItem('IQRA_OBE_STUDENTS', JSON.stringify(updated));
    return true;
  },

  async getDeptAdminProfile() {
    const res = await fetchWithTimeout(`${BASE_URL}/admin/profile/`, {
      headers: getHeaders()
    }, 5000);
    if (!res.ok) throw new Error('Failed to fetch admin profile');
    return res.json();
    // Returns: { departmentId, departmentName, employeeId, username, user_type }
  },

  async getTeachers() {
    const res = await fetchWithTimeout(`${BASE_URL}/teachers/`, {
      headers: getHeaders()
    }, 5000);
    if (!res.ok) throw new Error('Failed to fetch teachers');
    return res.json();
    // Returns: [{ employeeId, name, email, designation, departmentId, departmentName }]
  },

  async createTeacher(teacherData: { name: string; email: string; employeeId: string; designation: string; departmentId: string }) {
    const res = await fetchWithTimeout(`${BASE_URL}/admin/teachers/`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify(teacherData),
    }, 8000);
    if (!res.ok) {
      const errText = await res.text();
      let parsed;
      try { parsed = JSON.parse(errText); } catch(e) {}
      throw new Error(parsed?.message || parsed?.error || errText || 'Failed to onboarding faculty');
    }
    return res.json();
  },

  async deleteTeacher(employeeId: string): Promise<boolean> {
    const res = await fetchWithTimeout(`${BASE_URL}/admin/teachers/${employeeId}/`, {
      method: 'DELETE',
      headers: getHeaders(),
    }, 8000);
    if (!res.ok) {
      if (res.status === 409) {
        throw new Error("Conflict: This teacher has active course assignments or classes with students and cannot be deleted.");
      }
      const errText = await res.text();
      let parsed;
      try { parsed = JSON.parse(errText); } catch(e) {}
      throw new Error(parsed?.message || parsed?.error || errText || 'Failed to delete teacher from server');
    }
    return true;
  },

  async getSemesterPlans(programId?: string) {
    const url = programId
      ? `${BASE_URL}/admin/semester-plans/?programId=${programId}`
      : `${BASE_URL}/admin/semester-plans/`;
    const res = await fetchWithTimeout(url, { headers: getHeaders() }, 5000);
    if (!res.ok) throw new Error('Failed to fetch semester plans');
    return res.json();
    // Returns: [{ programId, semester, courseCodes }]
  },

  async saveSemesterPlan(programId: string, semester: string, courseCodes: string[]) {
    const res = await fetchWithTimeout(`${BASE_URL}/admin/semester-plans/`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify({ programId, semester, courseCodes }),
    }, 8000);
    if (!res.ok) throw new Error('Failed to save semester plan');
    return res.json();
  },

  async getStudentCourses() {
    const res = await fetchWithTimeout(`${BASE_URL}/student/courses/`, {
      headers: getHeaders()
    }, 5000);
    if (!res.ok) throw new Error('Failed to fetch student courses');
    return res.json();
    // Returns: [{ id, code, title, creditHours, categories, studentMarks }]
  },

  async getCourseAssignments() {
    const res = await fetchWithTimeout(`${BASE_URL}/admin/course-assignments/`, {
      headers: getHeaders()
    }, 5000);
    if (!res.ok) throw new Error('Failed to fetch course assignments');
    return res.json();
    // Returns: [{ teacherId, courseCode, programId }]
  },

  async assignCourse(teacherId: string, courseCode: string, programId?: string, academicYear?: string) {
    const res = await fetchWithTimeout(`${BASE_URL}/admin/course-assignments/`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify({ teacherId, courseCode, programId, academicYear }),
    }, 8000);
    if (!res.ok) {
      const errData = await res.json().catch(() => ({}));
      const errMsg = errData.detail || errData.error || errData.message || 'Failed to save course assignment';
      throw new Error(errMsg);
    }
    return res.json();
  },

  async finalizeCourse(courseId: string, academicYear: string): Promise<{ message: string }> {
    const res = await fetchWithTimeout(`${BASE_URL}/admin/finalize-course/`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify({ courseId, academicYear }),
    }, 8000);
    if (!res.ok) {
      const errData = await res.json().catch(() => ({}));
      throw new Error(errData.detail || errData.error || errData.message || 'Failed to finalize course');
    }
    return res.json();
  },

  async getFinalResults(params: { regNo?: string; courseCode?: string; academicYear?: string }): Promise<{ results: any[] }> {
    let url = `${BASE_URL}/reports/final-results/`;
    const queryParams: string[] = [];
    if (params.regNo) queryParams.push(`regNo=${params.regNo}`);
    if (params.courseCode) queryParams.push(`courseCode=${params.courseCode}`);
    if (params.academicYear) queryParams.push(`academicYear=${params.academicYear}`);
    if (queryParams.length > 0) {
      url += `?${queryParams.join('&')}`;
    }
    const res = await fetchWithTimeout(url, { headers: getHeaders() }, 5000);
    if (!res.ok) throw new Error('Failed to fetch final results');
    return res.json();
  },

  async removeCourseAssignment(teacherId: string, courseCode: string, programId?: string) {
    const res = await fetchWithTimeout(`${BASE_URL}/admin/course-assignments/`, {
      method: 'DELETE',
      headers: getHeaders(),
      body: JSON.stringify({ teacherId, courseCode, programId }),
    }, 8000);
    if (!res.ok) throw new Error('Failed to remove course assignment');
    return;
  },

  async getProgramGAAttainment(programId: string) {
    const res = await fetchWithTimeout(`${BASE_URL}/reports/program-ga-attainment/?programId=${programId.toLowerCase()}`, {
      headers: getHeaders()
    }, 5000);
    if (!res.ok) throw new Error('Failed to fetch program GA attainment');
    return res.json();
  },

  async getStudentGAAttainment(regNo: string) {
    const res = await fetchWithTimeout(`${BASE_URL}/reports/student-ga-attainment/?regNo=${regNo}`, {
      headers: getHeaders()
    }, 5000);
    if (!res.ok) throw new Error('Failed to fetch student GA attainment');
    return res.json();
  },

  async getCourseAttainment(courseCode: string, programId: string) {
    const res = await fetchWithTimeout(`${BASE_URL}/reports/course-attainment/?courseCode=${courseCode}&programId=${programId.toLowerCase()}`, {
      headers: getHeaders()
    }, 5000);
    if (!res.ok) throw new Error('Failed to fetch course attainment');
    return res.json();
  },

  async getStudentSummary(regNo: string) {
    const res = await fetchWithTimeout(`${BASE_URL}/reports/student-summary/?regNo=${regNo}`, {
      headers: getHeaders()
    }, 5000);
    if (!res.ok) throw new Error('Failed to fetch student summary');
    return res.json();
  },

  async getCourseCLOs(courseId: string) {
    const res = await fetchWithTimeout(`${BASE_URL}/instructor/courses/${courseId}/clos/`, {
      headers: getHeaders()
    }, 5000);
    if (!res.ok) throw new Error('Failed to fetch course CLOs');
    return res.json();
  },

  async createCourseCLO(courseId: string, data: { code: string; description: string; mappedGA: string | null; order: number }) {
    const res = await fetchWithTimeout(`${BASE_URL}/instructor/courses/${courseId}/clos/`, {
      method: 'POST',
      headers: {
        ...getHeaders(),
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(data)
    }, 5000);
    if (!res.ok) throw new Error('Failed to create course CLO');
    return res.json();
  },

  async updateCourseCLO(courseId: string, id: string | number, data: { description?: string; mappedGA?: string | null; order?: number }) {
    const res = await fetchWithTimeout(`${BASE_URL}/instructor/courses/${courseId}/clos/${id}/`, {
      method: 'PATCH',
      headers: {
        ...getHeaders(),
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(data)
    }, 5000);
    if (!res.ok) throw new Error('Failed to update course CLO');
    return res.json();
  },

  async deleteCourseCLO(courseId: string, id: string | number) {
    const res = await fetchWithTimeout(`${BASE_URL}/instructor/courses/${courseId}/clos/${id}/`, {
      method: 'DELETE',
      headers: getHeaders()
    }, 5000);
    if (!res.ok) throw new Error('Failed to delete course CLO');
    return true;
  },

  async getCOAttainmentSummary(programId: string, semester?: string, academicYear?: string) {
    let url = `${BASE_URL}/reports/co-attainment-summary/?programId=${programId}`;
    if (semester) url += `&semester=${semester}`;
    if (academicYear) url += `&academicYear=${academicYear}`;
    const res = await fetchWithTimeout(url, { headers: getHeaders() });
    return res.ok ? res.json() : null;
  },

  async getPOAttainment(programId: string) {
    const res = await fetchWithTimeout(
      `${BASE_URL}/reports/po-attainment/?programId=${programId}`,
      { headers: getHeaders() }
    );
    return res.ok ? res.json() : null;
  },

  async getGapAnalysis(programId: string) {
    const res = await fetchWithTimeout(
      `${BASE_URL}/reports/gap-analysis/?programId=${programId}`,
      { headers: getHeaders() }
    );
    return res.ok ? res.json() : null;
  },

  async getAtRiskStudents(programId: string, semester?: string) {
    let url = `${BASE_URL}/reports/at-risk-students/?programId=${programId}`;
    if (semester) url += `&semester=${semester}`;
    const res = await fetchWithTimeout(url, { headers: getHeaders() });
    return res.ok ? res.json() : null;
  },

  async getInstructorPerformance(departmentId: string) {
    const res = await fetchWithTimeout(
      `${BASE_URL}/reports/instructor-performance/?departmentId=${departmentId}`,
      { headers: getHeaders() }
    );
    return res.ok ? res.json() : null;
  },

  async getCohortComparison(programId: string, gaId?: string) {
    let url = `${BASE_URL}/reports/cohort-comparison/?programId=${programId}`;
    if (gaId) url += `&gaId=${gaId}`;
    const res = await fetchWithTimeout(url, { headers: getHeaders() });
    return res.ok ? res.json() : null;
  },

  saveLocalStorageData(data: OBEData): void {
    saveLocalStorageData(data);
  }
};

// Pre-populated high-fidelity dummy courses as placeholders if backend is down
const DUMMY_PLAYGROUND_COURSES: InstructorCourse[] = [
  {
    id: "course-demo-1",
    code: "SE-311",
    title: "Software Engineering",
    departmentId: "computing",
    departmentName: "Department of Computing and Technology",
    programId: "bscs",
    programName: "Bachelor of Science in Computer Science (BSCS)",
    creditHours: 3,
    categories: [
      { name: "Assignments", percentage: 15, units: 3 },
      { name: "Quizzes", percentage: 10, units: 3 },
      { name: "Class Participation", percentage: 5, units: 1 },
      { name: "Class Project", percentage: 15, units: 1 },
      { name: "Presentation", percentage: 5, units: 1 },
      { name: "Lab Project", percentage: 0, units: 0 },
      { name: "Problem Based Learning", percentage: 0, units: 0 },
      { name: "Complex Problem", percentage: 0, units: 0 },
      { name: "Other Activities", percentage: 0, units: 0 },
      { name: "Viva", percentage: 0, units: 0 },
      { name: "Lab Performance", percentage: 0, units: 0 },
      { name: "Lab Reports", percentage: 0, units: 0 },
      { name: "Mid Term", percentage: 20, units: 1 },
      { name: "Final", percentage: 30, units: 1 }
    ],
    unitsData: {
      "Assignments": [
        { unitNo: 1, passing: 5, totalMarks: 10, weightage: 33.3 },
        { unitNo: 2, passing: 5, totalMarks: 10, weightage: 33.3 },
        { unitNo: 3, passing: 5, totalMarks: 10, weightage: 33.4 }
      ],
      "Quizzes": [
        { unitNo: 1, passing: 5, totalMarks: 10, weightage: 33.3 },
        { unitNo: 2, passing: 5, totalMarks: 10, weightage: 33.3 },
        { unitNo: 3, passing: 5, totalMarks: 10, weightage: 33.4 }
      ],
      "Class Participation": [
        { unitNo: 1, passing: 5, totalMarks: 10, weightage: 100 }
      ],
      "Class Project": [
        { unitNo: 1, passing: 15, totalMarks: 30, weightage: 100 }
      ],
      "Presentation": [
        { unitNo: 1, passing: 5, totalMarks: 10, weightage: 100 }
      ],
      "Mid Term": [
        { unitNo: 1, passing: 15, totalMarks: 30, weightage: 100 }
      ],
      "Final": [
        { unitNo: 1, passing: 20, totalMarks: 40, weightage: 100 }
      ]
    },
    students: [
      {
        regNo: "012-fa22-22012",
        name: "Abdur Rehman Khalid",
        marks: {
          "Assignments-1": 8.5,
          "Assignments-2": 9.0,
          "Assignments-3": 7.5,
          "Quizzes-1": 7.0,
          "Quizzes-2": 8.5,
          "Quizzes-3": 9.0,
          "Class Participation-1": 9.0,
          "Class Project-1": 26.5,
          "Presentation-1": 8.0,
          "Mid Term-1": 24.5,
          "Final-1": 34.0
        }
      },
      {
        regNo: "045-fa22-22045",
        name: "Wajahat Bine Saif",
        marks: {
          "Assignments-1": 9.0,
          "Assignments-2": 8.0,
          "Assignments-3": 8.5,
          "Quizzes-1": 8.0,
          "Quizzes-2": 7.5,
          "Quizzes-3": 6.5,
          "Class Participation-1": 8.0,
          "Class Project-1": 25.0,
          "Presentation-1": 9.0,
          "Mid Term-1": 22.0,
          "Final-1": 32.5
        }
      },
      {
        regNo: "089-fa22-22089",
        name: "Zayan Ahmed Khan",
        marks: {
          "Assignments-1": 7.5,
          "Assignments-2": 7.0,
          "Assignments-3": 8.0,
          "Quizzes-1": 6.0,
          "Quizzes-2": 5.0,
          "Quizzes-3": 7.0,
          "Class Participation-1": 7.0,
          "Class Project-1": 22.0,
          "Presentation-1": 7.5,
          "Mid Term-1": 19.5,
          "Final-1": 28.0
        }
      }
    ],
    obeQuestions: [],
    obeMarks: {}
  },
  {
    id: "course-demo-2",
    code: "AI-381",
    title: "Artificial Intelligence",
    departmentId: "computing",
    departmentName: "Department of Computing and Technology",
    programId: "bscs",
    programName: "Bachelor of Science in Computer Science (BSCS)",
    creditHours: 3,
    categories: [
      { name: "Assignments", percentage: 10, units: 2 },
      { name: "Quizzes", percentage: 10, units: 2 },
      { name: "Class Participation", percentage: 5, units: 1 },
      { name: "Class Project", percentage: 20, units: 1 },
      { name: "Presentation", percentage: 5, units: 1 },
      { name: "Lab Project", percentage: 0, units: 0 },
      { name: "Problem Based Learning", percentage: 0, units: 0 },
      { name: "Complex Problem", percentage: 0, units: 0 },
      { name: "Other Activities", percentage: 0, units: 0 },
      { name: "Viva", percentage: 0, units: 0 },
      { name: "Lab Performance", percentage: 0, units: 0 },
      { name: "Lab Reports", percentage: 0, units: 0 },
      { name: "Mid Term", percentage: 20, units: 1 },
      { name: "Final", percentage: 30, units: 1 }
    ],
    unitsData: {
      "Assignments": [
        { unitNo: 1, passing: 5, totalMarks: 10, weightage: 50 },
        { unitNo: 2, passing: 5, totalMarks: 10, weightage: 50 }
      ],
      "Quizzes": [
        { unitNo: 1, passing: 5, totalMarks: 10, weightage: 50 },
        { unitNo: 2, passing: 5, totalMarks: 10, weightage: 50 }
      ],
      "Class Participation": [
        { unitNo: 1, passing: 5, totalMarks: 10, weightage: 100 }
      ],
      "Class Project": [
        { unitNo: 1, passing: 15, totalMarks: 30, weightage: 100 }
      ],
      "Presentation": [
        { unitNo: 1, passing: 5, totalMarks: 10, weightage: 100 }
      ],
      "Mid Term": [
        { unitNo: 1, passing: 15, totalMarks: 30, weightage: 100 }
      ],
      "Final": [
        { unitNo: 1, passing: 20, totalMarks: 40, weightage: 100 }
      ]
    },
    students: [
      {
        regNo: "012-fa22-22012",
        name: "Abdur Rehman Khalid",
        marks: {
          "Assignments-1": 9.0,
          "Assignments-2": 8.5,
          "Quizzes-1": 8.0,
          "Quizzes-2": 9.0,
          "Class Participation-1": 9.0,
          "Class Project-1": 27.0,
          "Presentation-1": 8.5,
          "Mid Term-1": 25.0,
          "Final-1": 35.0
        }
      },
      {
        regNo: "104-fa22-22104",
        name: "Misha Farooq",
        marks: {
          "Assignments-1": 8.0,
          "Assignments-2": 8.0,
          "Quizzes-1": 7.0,
          "Quizzes-2": 7.5,
          "Class Participation-1": 8.0,
          "Class Project-1": 24.0,
          "Presentation-1": 8.0,
          "Mid Term-1": 21.0,
          "Final-1": 31.0
        }
      }
    ],
    obeQuestions: [],
    obeMarks: {}
  }
];

const getLocalInstructorCourses = (): InstructorCourse[] => {
  const saved = localStorage.getItem('IQRA_OBE_INSTRUCTOR_COURSES');
  if (saved) {
    try {
      const parsed = JSON.parse(saved);
      if (Array.isArray(parsed) && parsed.length > 0) {
        return parsed.filter(c => c.id !== 'course-1' && c.id !== 'course-2');
      }
    } catch (e) {
      // ignore & use default fallback
    }
  }
  localStorage.setItem('IQRA_OBE_INSTRUCTOR_COURSES', JSON.stringify(DUMMY_PLAYGROUND_COURSES));
  return DUMMY_PLAYGROUND_COURSES;
};
