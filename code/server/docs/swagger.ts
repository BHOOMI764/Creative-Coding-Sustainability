import swaggerJsdoc from 'swagger-jsdoc';
import swaggerUi from 'swagger-ui-express';
import { Express } from 'express';

const options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'Code Sustainability API',
      version: '1.0.0',
      description: 'A comprehensive API for managing sustainable development projects and fostering innovation in coding for social good.',
      contact: {
        name: 'API Support',
        email: 'support@sustainability-platform.com',
        url: 'https://sustainability-platform.com/support',
      },
      license: {
        name: 'MIT',
        url: 'https://opensource.org/licenses/MIT',
      },
    },
    servers: [
      {
        url: 'http://localhost:3000',
        description: 'Development server',
      },
      {
        url: 'https://api.sustainability-platform.com',
        description: 'Production server',
      },
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
        },
        apiKey: {
          type: 'apiKey',
          in: 'header',
          name: 'X-API-Key',
        },
      },
      schemas: {
        User: {
          type: 'object',
          required: ['id', 'username', 'email', 'role'],
          properties: {
            id: {
              type: 'integer',
              description: 'Unique user identifier',
              example: 1,
            },
            username: {
              type: 'string',
              description: 'User username',
              example: 'john_doe',
            },
            email: {
              type: 'string',
              format: 'email',
              description: 'User email address',
              example: 'john@example.com',
            },
            role: {
              type: 'string',
              enum: ['viewer', 'student', 'faculty', 'admin'],
              description: 'User role',
              example: 'student',
            },
            firstName: {
              type: 'string',
              description: 'User first name',
              example: 'John',
            },
            lastName: {
              type: 'string',
              description: 'User last name',
              example: 'Doe',
            },
            profileImage: {
              type: 'string',
              format: 'uri',
              description: 'User profile image URL',
              example: 'https://example.com/avatar.jpg',
            },
            isEmailVerified: {
              type: 'boolean',
              description: 'Email verification status',
              example: true,
            },
            createdAt: {
              type: 'string',
              format: 'date-time',
              description: 'User creation timestamp',
            },
            updatedAt: {
              type: 'string',
              format: 'date-time',
              description: 'User last update timestamp',
            },
          },
        },
        Project: {
          type: 'object',
          required: ['id', 'title', 'description', 'thumbnailUrl'],
          properties: {
            id: {
              type: 'integer',
              description: 'Unique project identifier',
              example: 1,
            },
            title: {
              type: 'string',
              description: 'Project title',
              example: 'Smart Water Management System',
            },
            description: {
              type: 'string',
              description: 'Project description',
              example: 'AI-powered water conservation system for urban areas',
            },
            thumbnailUrl: {
              type: 'string',
              format: 'uri',
              description: 'Project thumbnail image URL',
              example: 'https://example.com/thumbnail.jpg',
            },
            repositoryUrl: {
              type: 'string',
              format: 'uri',
              description: 'Project repository URL',
              example: 'https://github.com/example/project',
            },
            demoUrl: {
              type: 'string',
              format: 'uri',
              description: 'Project demo URL',
              example: 'https://demo.example.com',
            },
            teamId: {
              type: 'integer',
              description: 'Team identifier',
              example: 1,
            },
            averageRating: {
              type: 'number',
              format: 'float',
              description: 'Average project rating',
              example: 4.8,
            },
            sdgs: {
              type: 'array',
              items: {
                $ref: '#/components/schemas/SDG',
              },
              description: 'Associated Sustainable Development Goals',
            },
            mediaUrls: {
              type: 'array',
              items: {
                type: 'string',
                format: 'uri',
              },
              description: 'Project media URLs',
            },
            createdAt: {
              type: 'string',
              format: 'date-time',
              description: 'Project creation timestamp',
            },
            updatedAt: {
              type: 'string',
              format: 'date-time',
              description: 'Project last update timestamp',
            },
          },
        },
        SDG: {
          type: 'object',
          required: ['id', 'number', 'name', 'description', 'color'],
          properties: {
            id: {
              type: 'integer',
              description: 'Unique SDG identifier',
              example: 1,
            },
            number: {
              type: 'integer',
              description: 'SDG number (1-17)',
              example: 6,
            },
            name: {
              type: 'string',
              description: 'SDG name',
              example: 'Clean Water and Sanitation',
            },
            description: {
              type: 'string',
              description: 'SDG description',
              example: 'Ensure availability and sustainable management of water and sanitation for all',
            },
            iconPath: {
              type: 'string',
              description: 'SDG icon path',
              example: '/icons/sdg-6.svg',
            },
            color: {
              type: 'string',
              description: 'SDG color code',
              example: '#26BDE2',
            },
          },
        },
        Feedback: {
          type: 'object',
          required: ['id', 'content', 'rating', 'userId', 'projectId'],
          properties: {
            id: {
              type: 'integer',
              description: 'Unique feedback identifier',
              example: 1,
            },
            content: {
              type: 'string',
              description: 'Feedback content',
              example: 'Great project with innovative approach!',
            },
            rating: {
              type: 'integer',
              minimum: 1,
              maximum: 5,
              description: 'Feedback rating (1-5)',
              example: 5,
            },
            isPrivate: {
              type: 'boolean',
              description: 'Whether feedback is private',
              example: false,
            },
            userId: {
              type: 'integer',
              description: 'User who provided feedback',
              example: 1,
            },
            projectId: {
              type: 'integer',
              description: 'Project receiving feedback',
              example: 1,
            },
            createdAt: {
              type: 'string',
              format: 'date-time',
              description: 'Feedback creation timestamp',
            },
          },
        },
        Error: {
          type: 'object',
          required: ['error', 'message'],
          properties: {
            error: {
              type: 'string',
              description: 'Error type',
              example: 'ValidationError',
            },
            message: {
              type: 'string',
              description: 'Error message',
              example: 'Invalid input data',
            },
            details: {
              type: 'object',
              description: 'Additional error details',
            },
          },
        },
        Pagination: {
          type: 'object',
          properties: {
            page: {
              type: 'integer',
              description: 'Current page number',
              example: 1,
            },
            limit: {
              type: 'integer',
              description: 'Number of items per page',
              example: 10,
            },
            total: {
              type: 'integer',
              description: 'Total number of items',
              example: 100,
            },
            pages: {
              type: 'integer',
              description: 'Total number of pages',
              example: 10,
            },
          },
        },
      },
      responses: {
        UnauthorizedError: {
          description: 'Authentication information is missing or invalid',
          content: {
            'application/json': {
              schema: {
                $ref: '#/components/schemas/Error',
              },
            },
          },
        },
        ForbiddenError: {
          description: 'Access denied',
          content: {
            'application/json': {
              schema: {
                $ref: '#/components/schemas/Error',
              },
            },
          },
        },
        NotFoundError: {
          description: 'Resource not found',
          content: {
            'application/json': {
              schema: {
                $ref: '#/components/schemas/Error',
              },
            },
          },
        },
        ValidationError: {
          description: 'Validation error',
          content: {
            'application/json': {
              schema: {
                $ref: '#/components/schemas/Error',
              },
            },
          },
        },
        ServerError: {
          description: 'Internal server error',
          content: {
            'application/json': {
              schema: {
                $ref: '#/components/schemas/Error',
              },
            },
          },
        },
      },
    },
    security: [
      {
        bearerAuth: [],
      },
    ],
  },
  apis: [
    './server/routes/*.js',
    './server/controllers/*.js',
    './server/models/*.js',
  ],
};

const specs = swaggerJsdoc(options);

export const setupSwagger = (app: Express) => {
  // Swagger UI options
  const swaggerUiOptions = {
    customCss: '.swagger-ui .topbar { display: none }',
    customSiteTitle: 'Code Sustainability API Documentation',
    customfavIcon: '/favicon.ico',
    swaggerOptions: {
      persistAuthorization: true,
      displayRequestDuration: true,
      filter: true,
      showExtensions: true,
      showCommonExtensions: true,
    },
  };

  // Serve Swagger UI
  app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(specs, swaggerUiOptions));

  // Serve OpenAPI JSON
  app.get('/api-docs.json', (req, res) => {
    res.setHeader('Content-Type', 'application/json');
    res.send(specs);
  });

  return specs;
};

export default setupSwagger;
