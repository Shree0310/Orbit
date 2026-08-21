// app/api/traces/achievr-sample/route.ts
import { NextResponse } from 'next/server';
import { achievrToTraceEvents, type AchieverPlannerResponse } from '@/lib/achievrAdapter';

/**
 * Sample endpoint that simulates a real Achievr planner response.
 * This demonstrates what a real trace would look like.
 *
 * In production, this would be replaced by actual Achievr API calls.
 */
export async function GET() {
  // Simulate a realistic Achievr planner response
  // This is based on actual tool call patterns from Achievr
  const mockAchieverResponse: AchieverPlannerResponse = {
    toolCalls: [
      {
        tool: 'explain_approach',
        args: {
          context: 'I\'ll help you plan a mobile fitness app with task tracking, workout plans, and progress visualization.',
          bullets: [
            'Define core MVP features (user auth, workout library, progress tracking)',
            'Design data models for users, workouts, and exercises',
            'Plan UI components and navigation flow',
            'Set up backend API and database structure'
          ]
        }
      },
      {
        tool: 'list_features',
        args: {
          heading: 'Core Features for MVP',
          items: [
            'User authentication and profile management',
            'Pre-built workout library with categories',
            'Custom workout creator',
            'Exercise tracking with sets/reps/weight',
            'Progress charts and statistics',
            'Workout history and calendar view'
          ]
        }
      },
      {
        tool: 'create_task_card',
        args: {
          title: 'Set up project structure and authentication',
          description: 'Initialize Next.js project with TypeScript, set up Supabase for auth and database, implement login/signup flow',
          duration: '1 day',
          priority: 'high'
        }
      },
      {
        tool: 'create_task_card',
        args: {
          title: 'Design and implement workout data models',
          description: 'Create database schemas for exercises, workouts, and user workout history. Set up relationships and indexes.',
          duration: '4 hours',
          priority: 'high'
        }
      },
      {
        tool: 'create_task_card',
        args: {
          title: 'Build workout library UI',
          description: 'Create components for browsing workouts, filtering by category, and viewing workout details',
          duration: '6 hours',
          priority: 'medium'
        }
      },
      {
        tool: 'create_task_card',
        args: {
          title: 'Implement exercise tracking interface',
          description: 'Build UI for logging sets/reps/weight during workouts with real-time validation',
          duration: '8 hours',
          priority: 'medium'
        }
      },
      {
        tool: 'create_task_card',
        args: {
          title: 'Create progress visualization dashboard',
          description: 'Implement charts showing workout frequency, volume progression, and personal records',
          duration: '6 hours',
          priority: 'low'
        }
      },
      {
        tool: 'suggest_actions',
        args: {
          prompt: 'What would you like to focus on next?',
          actions: [
            { id: '1', label: 'Add more detailed tasks' },
            { id: '2', label: 'Discuss technical architecture' },
            { id: '3', label: 'Estimate timeline and resources' },
            { id: '4', label: 'Review and refine the plan' }
          ]
        }
      }
    ],
    text: 'Here\'s a comprehensive plan for your mobile fitness app.',
    _meta: {
      mode: 'demo',
      source: 'orbit-sample'
    }
  };

  // Convert to Orbit TraceEvents
  const traceEvents = achievrToTraceEvents(mockAchieverResponse);

  return NextResponse.json(traceEvents);
}
