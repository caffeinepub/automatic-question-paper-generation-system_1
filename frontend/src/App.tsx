import { RouterProvider, createRouter, createRoute, createRootRoute, redirect, Outlet } from '@tanstack/react-router';
import { Toaster } from '@/components/ui/sonner';
import LoginPage from './pages/LoginPage';
import DashboardPage from './pages/DashboardPage';
import AddQuestionsPage from './pages/AddQuestionsPage';
import QuestionBankPage from './pages/QuestionBankPage';
import ManageSubjectsPage from './pages/ManageSubjectsPage';
import GeneratePaperPage from './pages/GeneratePaperPage';
import GeneratedPapersPage from './pages/GeneratedPapersPage';
import PaperPreviewPage from './pages/PaperPreviewPage';

function isAuthenticated(): boolean {
  return localStorage.getItem('qpg_session') === 'true';
}

const rootRoute = createRootRoute({
  component: () => (
    <>
      <Outlet />
      <Toaster richColors position="top-right" />
    </>
  ),
});

const loginRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/',
  component: LoginPage,
  beforeLoad: () => {
    if (isAuthenticated()) {
      throw redirect({ to: '/dashboard' });
    }
  },
});

const loginAltRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/login',
  component: LoginPage,
  beforeLoad: () => {
    if (isAuthenticated()) {
      throw redirect({ to: '/dashboard' });
    }
  },
});

const dashboardRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/dashboard',
  component: DashboardPage,
  beforeLoad: () => {
    if (!isAuthenticated()) {
      throw redirect({ to: '/' });
    }
  },
});

const addQuestionRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/add-question',
  component: AddQuestionsPage,
  beforeLoad: () => {
    if (!isAuthenticated()) {
      throw redirect({ to: '/' });
    }
  },
});

const editQuestionRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/add-question/$id',
  component: AddQuestionsPage,
  beforeLoad: () => {
    if (!isAuthenticated()) {
      throw redirect({ to: '/' });
    }
  },
});

const questionBankRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/question-bank',
  component: QuestionBankPage,
  beforeLoad: () => {
    if (!isAuthenticated()) {
      throw redirect({ to: '/' });
    }
  },
});

const manageSubjectsRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/manage-subjects',
  component: ManageSubjectsPage,
  beforeLoad: () => {
    if (!isAuthenticated()) {
      throw redirect({ to: '/' });
    }
  },
});

const generatePaperRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/generate-paper',
  component: GeneratePaperPage,
  beforeLoad: () => {
    if (!isAuthenticated()) {
      throw redirect({ to: '/' });
    }
  },
});

const generatedPapersRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/generated-papers',
  component: GeneratedPapersPage,
  beforeLoad: () => {
    if (!isAuthenticated()) {
      throw redirect({ to: '/' });
    }
  },
});

const paperPreviewRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/paper-preview/$paperId',
  component: PaperPreviewPage,
  beforeLoad: () => {
    if (!isAuthenticated()) {
      throw redirect({ to: '/' });
    }
  },
});

const routeTree = rootRoute.addChildren([
  loginRoute,
  loginAltRoute,
  dashboardRoute,
  addQuestionRoute,
  editQuestionRoute,
  questionBankRoute,
  manageSubjectsRoute,
  generatePaperRoute,
  generatedPapersRoute,
  paperPreviewRoute,
]);

const router = createRouter({ routeTree });

declare module '@tanstack/react-router' {
  interface Register {
    router: typeof router;
  }
}

export default function App() {
  return <RouterProvider router={router} />;
}
