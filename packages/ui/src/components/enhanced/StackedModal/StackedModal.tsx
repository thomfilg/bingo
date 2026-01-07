import { ChevronLeft as ChevronLeftIcon, Close as CloseIcon } from '@mui/icons-material';
import {
  alpha,
  Box,
  Button,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  IconButton,
  Paper,
  Skeleton,
  Slide,
  Stack,
  styled,
  Typography,
  useMediaQuery,
  useTheme,
} from '@mui/material';
import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  ReactNode,
  FC,
  forwardRef,
} from 'react';
import { TransitionProps } from '@mui/material/transitions';

// Types
export interface StackedModalProps {
  open: boolean;
  onClose: () => void;
  glass?: boolean;
  navigationTitle?: string;
  children?: ReactNode;
  actions?: ReactNode;
  modalId?: string;
  closeOnClickOutside?: boolean;
  closeOnEsc?: boolean;
  loading?: boolean;
  loadingText?: string;
  fullScreen?: boolean;
  maxWidth?: 'xs' | 'sm' | 'md' | 'lg' | 'xl' | false;
  disableBackdrop?: boolean;
  disableFocusTrap?: boolean;
  keepMounted?: boolean;
  'aria-labelledby'?: string;
  'aria-describedby'?: string;
  rtl?: boolean;
}

interface ModalInfo {
  id: string;
  zIndex: number;
  role: 'primary' | 'secondary' | 'background';
}

interface ModalStackContextValue {
  stack: ModalInfo[];
  pushModal: (modalId: string) => void;
  popModal: (modalId?: string) => void;
  clearStack: () => void;
  currentDepth: number;
  isModalInStack: (modalId: string) => boolean;
  getModalRole: (modalId: string) => 'primary' | 'secondary' | 'background' | null;
}

// Modal Stack Context
const ModalStackContext = createContext<ModalStackContextValue>({
  stack: [],
  pushModal: () => {
    /** do nothing */
  },
  popModal: () => {
    /** do nothing */
  },
  clearStack: () => {
    /** do nothing */
  },
  currentDepth: 0,
  isModalInStack: () => false,
  getModalRole: () => null,
});

// Hook to use modal stack
export const useModalStack = () => {
  const context = useContext(ModalStackContext);
  if (!context) {
    throw new Error('useModalStack must be used within a ModalStackProvider');
  }
  return context;
};

// Modal Stack Provider
export const ModalStackProvider: FC<{ children: ReactNode }> = ({ children }) => {
  const [stack, setStack] = useState<ModalInfo[]>([]);
  const baseZIndex = 1300; // MUI Dialog default z-index

  const pushModal = useCallback(
    (modalId: string) => {
      setStack((prev) => {
        // Check if modal already exists
        if (prev.some((m) => m.id === modalId)) return prev;

        // Update roles for existing modals
        const updatedStack = prev.map((modal, index) => ({
          ...modal,
          role:
            index === prev.length - 1 ? 'secondary' : ('background' as 'secondary' | 'background'),
        }));

        // Add new modal as primary
        return [
          ...updatedStack,
          {
            id: modalId,
            zIndex: baseZIndex + prev.length * 10,
            role: 'primary' as const,
          },
        ];
      });
    },
    [baseZIndex],
  );

  const popModal = useCallback((modalId?: string) => {
    setStack((prev) => {
      if (modalId) {
        // Remove specific modal
        const newStack = prev.filter((m) => m.id !== modalId);
        // Update roles
        return newStack.map(
          (modal, index) =>
            ({
              ...modal,
              role:
                index === newStack.length - 1
                  ? 'primary'
                  : index === newStack.length - 2
                    ? 'secondary'
                    : 'background',
            }) as ModalInfo,
        );
      } else {
        // Remove top modal
        const newStack = prev.slice(0, -1);
        // Update roles
        return newStack.map(
          (modal, index) =>
            ({
              ...modal,
              role:
                index === newStack.length - 1
                  ? 'primary'
                  : index === newStack.length - 2
                    ? 'secondary'
                    : 'background',
            }) as ModalInfo,
        );
      }
    });
  }, []);

  const clearStack = useCallback(() => {
    setStack([]);
  }, []);

  const isModalInStack = useCallback(
    (modalId: string) => {
      return stack.some((m) => m.id === modalId);
    },
    [stack],
  );

  const getModalRole = useCallback(
    (modalId: string) => {
      const modal = stack.find((m) => m.id === modalId);
      return modal?.role || null;
    },
    [stack],
  );

  const value = useMemo(
    () => ({
      stack,
      pushModal,
      popModal,
      clearStack,
      currentDepth: stack.length,
      isModalInStack,
      getModalRole,
    }),
    [stack, pushModal, popModal, clearStack, isModalInStack, getModalRole],
  );

  return <ModalStackContext.Provider value={value}>{children}</ModalStackContext.Provider>;
};

// Focus trap helper
const useFocusTrap = (ref: React.RefObject<HTMLElement>, isActive: boolean, disabled?: boolean) => {
  useEffect(() => {
    if (!isActive || disabled || !ref.current) return;

    const element = ref.current;
    const focusableElements = element.querySelectorAll(
      'a[href], button, textarea, input, select, [tabindex]:not([tabindex="-1"])',
    );

    const firstElement = focusableElements[0] as HTMLElement;
    const lastElement = focusableElements[focusableElements.length - 1] as HTMLElement;

    // Focus first element
    window.setTimeout(() => firstElement?.focus(), 100);

    const handleTabKey = (e: globalThis.KeyboardEvent) => {
      if (e.key !== 'Tab') return;

      if (e.shiftKey) {
        if (document.activeElement === firstElement) {
          e.preventDefault();
          lastElement?.focus();
        }
      } else {
        if (document.activeElement === lastElement) {
          e.preventDefault();
          firstElement?.focus();
        }
      }
    };

    element.addEventListener('keydown', handleTabKey);
    return () => element.removeEventListener('keydown', handleTabKey);
  }, [ref, isActive, disabled]);
};

// Body scroll lock
const useBodyScrollLock = (isLocked: boolean) => {
  useEffect(() => {
    if (!isLocked) return;

    const originalStyle = window.getComputedStyle(document.body).overflow;
    document.body.style.overflow = 'hidden';

    return () => {
      document.body.style.overflow = originalStyle;
    };
  }, [isLocked]);
};

// Styled Components
const StyledDialog = styled(Dialog, {
  shouldForwardProp: (prop) =>
    !['modalRole', 'isAnimating', 'glass', 'rtl'].includes(prop as string),
})<{ modalRole?: string; isAnimating?: boolean; glass?: boolean; rtl?: boolean }>(
  ({ theme, modalRole, isAnimating, glass, rtl }) => ({
    direction: rtl ? 'rtl' : 'ltr',
    '& .MuiBackdrop-root': {
      backgroundColor:
        modalRole === 'secondary'
          ? 'rgba(0, 0, 0, 0.3)'
          : modalRole === 'background'
            ? 'rgba(0, 0, 0, 0.1)'
            : 'rgba(0, 0, 0, 0.5)',
      backdropFilter: modalRole === 'primary' ? 'blur(4px)' : 'none',
    },
    '& .MuiDialog-container': {
      alignItems: 'flex-start',
      justifyContent: 'flex-end',
    },
    '& .MuiDialog-paper': {
      margin: 0,
      position: 'fixed',
      right: 0,
      top: 0,
      height: '100vh',
      maxHeight: '100vh',
      borderRadius: 0,
      willChange: 'transform, width, border-radius',
      transition: theme.transitions.create(
        ['width', 'max-width', 'border-radius', 'transform', 'opacity'],
        {
          duration: 300,
          easing: theme.transitions.easing.easeInOut,
        },
      ),
      ...(modalRole === 'primary' && {
        // Mobile: 100%
        [theme.breakpoints.down('sm')]: {
          width: '100%',
          maxWidth: '100%',
        },
        // Tablet: 90%
        [theme.breakpoints.between('sm', 'md')]: {
          width: '90vw',
          maxWidth: '90vw',
        },
        // Desktop: 80%
        [theme.breakpoints.between('md', 'lg')]: {
          width: '80vw',
          maxWidth: '80vw',
        },
        // Large screens: 70%
        [theme.breakpoints.up('lg')]: {
          width: '70vw',
          maxWidth: '70vw',
        },
      }),
      ...(modalRole === 'secondary' && {
        width: '100vw !important',
        maxWidth: '100vw !important',
        right: '0 !important',
        top: '0 !important',
        height: '100vh',
        maxHeight: '100vh',
        borderRadius: '0 !important',
        opacity: 0.95,
        transform: 'scale(1)',
      }),
      ...(modalRole === 'background' && {
        display: 'none', // Hide background modals for performance
      }),
      ...(glass &&
        modalRole === 'primary' && {
          backgroundColor: alpha(theme.palette.background.paper, 0.85),
          backdropFilter: 'blur(10px)',
          WebkitBackdropFilter: 'blur(10px)',
          border: `1px solid ${alpha(theme.palette.divider, 0.18)}`,
        }),
      ...(isAnimating && {
        animation:
          modalRole === 'secondary'
            ? 'expandModal 300ms ease-in-out forwards'
            : modalRole === 'primary'
              ? 'contractModal 300ms ease-in-out forwards'
              : 'none',
      }),
    },
    '@keyframes expandModal': {
      from: {
        width: '70vw',
        transform: 'translateX(0)',
      },
      to: {
        width: '100vw',
        transform: 'translateX(0)',
      },
    },
    '@keyframes contractModal': {
      from: {
        width: '100vw',
        transform: 'translateX(0)',
      },
      to: {
        width: '70vw',
        transform: 'translateX(0)',
      },
    },
  }),
);

const StyledDialogTitle = styled(DialogTitle, {
  shouldForwardProp: (prop) => !['rtl'].includes(prop as string),
})<{ rtl?: boolean }>(({ theme, rtl }) => ({
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between',
  padding: theme.spacing(2, 2.5),
  borderBottom: `1px solid ${theme.palette.divider}`,
  direction: rtl ? 'rtl' : 'ltr',
}));

const DialogTitleLeft = styled(Box)(({ theme }) => ({
  display: 'flex',
  alignItems: 'center',
  gap: theme.spacing(1.5),
  flex: 1,
}));

const DialogTitleRight = styled(Box)(({ theme }) => ({
  display: 'flex',
  alignItems: 'center',
  gap: theme.spacing(1),
}));

const LoadingOverlay = styled(Box)(({ theme }) => ({
  position: 'absolute',
  top: 0,
  left: 0,
  right: 0,
  bottom: 0,
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  justifyContent: 'center',
  backgroundColor: alpha(theme.palette.background.paper, 0.8),
  zIndex: 9999,
}));

// Modal subcomponents
export const ModalContent: typeof DialogContent = styled(DialogContent)(({ theme }) => ({
  padding: theme.spacing(3),
})) as typeof DialogContent;

// ModalActions component that will be rendered differently based on device
export const ModalActions: FC<{ children: ReactNode }> = ({ children }) => {
  // This component is just a wrapper, actual placement is handled in StackedModal
  return <>{children}</>;
};

// Custom transition for slide from right
const SlideTransition = forwardRef<HTMLDivElement, TransitionProps>(
  function SlideTransition(props, ref) {
    return (
      <Slide direction="left" ref={ref} {...props}>
        {props.children as React.ReactElement}
      </Slide>
    );
  },
);

// StackedModal Component
export const StackedModal: FC<StackedModalProps> = ({
  open = false,
  onClose,
  glass = false,
  navigationTitle = '',
  children,
  actions,
  modalId = Math.random().toString(36).substring(2, 11),
  closeOnClickOutside = true,
  closeOnEsc = true,
  loading = false,
  loadingText = 'Loading...',
  fullScreen,
  maxWidth = false,
  disableBackdrop = false,
  disableFocusTrap = false,
  keepMounted = false,
  rtl = false,
  'aria-labelledby': ariaLabelledBy,
  'aria-describedby': ariaDescribedBy,
  ...otherProps
}) => {
  // Extract ModalActions from children
  let modalContent = children;
  let modalActions = null;

  React.Children.forEach(children, (child) => {
    if (React.isValidElement(child) && child.type === ModalActions) {
      modalActions = child.props.children;
    }
  });

  // Filter out ModalActions from children for content
  modalContent = React.Children.toArray(children).filter(
    (child) => !(React.isValidElement(child) && child.type === ModalActions),
  );
  const [modalRole, setModalRole] = useState<'primary' | 'secondary' | 'background'>('primary');
  const [isAnimating, setIsAnimating] = useState(false);
  const [showSkeleton, setShowSkeleton] = useState(loading);
  const dialogRef = useRef<HTMLDivElement>(null);
  const previousRoleRef = useRef(modalRole);
  const { stack, pushModal, popModal, getModalRole, isModalInStack } = useModalStack();

  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  // const isTablet = useMediaQuery(theme.breakpoints.between('sm', 'md')); // Reserved for future use

  // Use focus trap
  useFocusTrap(dialogRef, open && modalRole === 'primary', disableFocusTrap);

  // Lock body scroll
  useBodyScrollLock(open && modalRole === 'primary');

  // Handle ESC key press
  useEffect(() => {
    if (!open || !closeOnEsc || modalRole !== 'primary') return;

    const handleEsc = (e: globalThis.KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.preventDefault();
        onClose();
      }
    };

    window.addEventListener('keydown', handleEsc);
    return () => window.removeEventListener('keydown', handleEsc);
  }, [open, closeOnEsc, onClose, modalRole]);

  // Handle loading state
  useEffect(() => {
    if (loading) {
      setShowSkeleton(true);
    } else {
      // Delay hiding skeleton for smooth transition
      const timer = window.setTimeout(() => setShowSkeleton(false), 200);
      return () => window.clearTimeout(timer);
    }
  }, [loading]);

  // Determine modal role based on stack position
  useEffect(() => {
    if (!open) return;

    if (!isModalInStack(modalId)) {
      pushModal(modalId);
    }

    const newRole = getModalRole(modalId) || 'primary';

    if (newRole !== modalRole) {
      setIsAnimating(true);
      previousRoleRef.current = modalRole;
      setModalRole(newRole);

      window.setTimeout(() => setIsAnimating(false), 300);
    }
  }, [stack, modalId, open, pushModal, modalRole, getModalRole, isModalInStack]);

  // Clean up on close
  useEffect(() => {
    if (!open && isModalInStack(modalId)) {
      const timer = window.setTimeout(() => {
        popModal(modalId);
      }, 300);
      return () => window.clearTimeout(timer);
    }
  }, [open, modalId, popModal, isModalInStack]);

  // Don't render if in background (performance optimization)
  if (modalRole === 'background' && !keepMounted) return null;

  const handleBackClick = () => {
    if (stack.length > 1) {
      onClose();
    }
  };

  const handleClose = (_event: object, reason: 'backdropClick' | 'escapeKeyDown') => {
    if (modalRole !== 'primary') return;

    if (reason === 'backdropClick' && !closeOnClickOutside) return;
    if (reason === 'escapeKeyDown' && !closeOnEsc) return;

    onClose();
  };

  // Use slide transition for all devices
  const Transition = SlideTransition;

  // Generate unique IDs for accessibility
  const titleId = ariaLabelledBy || `modal-title-${modalId}`;
  const descId = ariaDescribedBy || `modal-desc-${modalId}`;

  return (
    <StyledDialog
      ref={dialogRef}
      open={open}
      onClose={handleClose}
      fullScreen={fullScreen ?? isMobile}
      modalRole={modalRole}
      isAnimating={isAnimating}
      glass={glass}
      rtl={rtl}
      TransitionComponent={Transition}
      maxWidth={maxWidth}
      disableEscapeKeyDown={!closeOnEsc}
      hideBackdrop={disableBackdrop}
      keepMounted={keepMounted}
      aria-labelledby={titleId}
      aria-describedby={descId}
      sx={{
        zIndex: stack.find((m) => m.id === modalId)?.zIndex || 1300,
      }}
      {...otherProps}
    >
      {/* Loading Overlay */}
      {showSkeleton && (
        <LoadingOverlay>
          <CircularProgress size={40} />
          {loadingText && (
            <Typography variant="body2" sx={{ mt: 2 }}>
              {loadingText}
            </Typography>
          )}
        </LoadingOverlay>
      )}

      <StyledDialogTitle id={titleId} rtl={rtl}>
        <DialogTitleLeft>
          {stack.length > 1 ? (
            <IconButton
              edge="start"
              color="inherit"
              onClick={handleBackClick}
              aria-label="go back"
              size="small"
              sx={{ transform: rtl ? 'rotate(180deg)' : 'none' }}
            >
              <ChevronLeftIcon />
            </IconButton>
          ) : (
            <IconButton
              edge="start"
              color="inherit"
              onClick={onClose}
              aria-label="close"
              size="small"
            >
              <CloseIcon />
            </IconButton>
          )}
          {navigationTitle && (
            <Typography variant="h6" component="h2" noWrap sx={{ ml: 1 }}>
              {navigationTitle}
            </Typography>
          )}
        </DialogTitleLeft>
        <DialogTitleRight>
          {/* On desktop, show modalActions or actions prop in header */}
          {!isMobile && (modalActions || actions)}
        </DialogTitleRight>
      </StyledDialogTitle>

      <Box id={descId} sx={{ position: 'relative', flex: 1, overflow: 'auto' }}>
        {showSkeleton ? (
          <Box sx={{ p: 3 }}>
            <Skeleton variant="text" width="60%" height={32} />
            <Skeleton variant="text" width="100%" />
            <Skeleton variant="text" width="100%" />
            <Skeleton variant="rectangular" height={200} sx={{ mt: 2 }} />
          </Box>
        ) : (
          modalContent
        )}
      </Box>

      {/* On mobile, show modalActions at the bottom */}
      {isMobile && (modalActions || actions) && (
        <DialogActions
          sx={{
            borderTop: (theme) => `1px solid ${theme.palette.divider}`,
            padding: 2,
          }}
        >
          {modalActions || actions}
        </DialogActions>
      )}
    </StyledDialog>
  );
};

// Default export for backward compatibility
export default StackedModal;

// Demo Application for testing
export const DemoApp: FC = () => {
  const [isFirstModalOpen, setIsFirstModalOpen] = useState(false);
  const [isSecondModalOpen, setIsSecondModalOpen] = useState(false);
  const [isThirdModalOpen, setIsThirdModalOpen] = useState(false);

  return (
    <ModalStackProvider>
      <Box sx={{ p: 5, minHeight: '100vh', bgcolor: 'grey.50' }}>
        <Typography variant="h4" gutterBottom fontWeight="bold">
          StackedModal Demo with Material-UI
        </Typography>

        <Button
          variant="contained"
          size="large"
          onClick={() => setIsFirstModalOpen(true)}
          sx={{
            background: 'linear-gradient(135deg, #667EEA 0%, #764BA2 100%)',
            color: 'white',
            px: 3,
            py: 1.5,
            '&:hover': {
              transform: 'translateY(-2px)',
              boxShadow: 4,
            },
            transition: 'all 0.2s',
          }}
        >
          Open First Modal
        </Button>

        {/* First Modal */}
        <StackedModal
          open={isFirstModalOpen}
          onClose={() => setIsFirstModalOpen(false)}
          glass={true}
          navigationTitle="First Modal"
          modalId="modal-1"
          actions={
            <Button variant="contained" size="small" onClick={() => window.alert('Save clicked!')}>
              Save
            </Button>
          }
        >
          <Box sx={{ p: 4 }}>
            <Typography variant="h5" gutterBottom fontWeight={600}>
              Welcome to the First Modal
            </Typography>
            <Typography variant="body1" color="text.secondary" paragraph>
              This is the primary modal with glass effect enabled. You can see the background
              content through it. The modal adapts its size based on the viewport: 100% on mobile,
              90% on tablet, 80% on desktop, and 70% on large screens.
            </Typography>

            <Button variant="contained" color="success" onClick={() => setIsSecondModalOpen(true)}>
              Open Second Modal
            </Button>
          </Box>
        </StackedModal>

        {/* Second Modal */}
        <StackedModal
          open={isSecondModalOpen}
          onClose={() => setIsSecondModalOpen(false)}
          navigationTitle="Second Modal"
          modalId="modal-2"
          actions={
            <Stack direction="row" spacing={1}>
              <Button variant="outlined" size="small" onClick={() => setIsSecondModalOpen(false)}>
                Cancel
              </Button>
              <Button variant="contained" size="small">
                Continue
              </Button>
            </Stack>
          }
        >
          <Box sx={{ p: 4 }}>
            <Typography variant="h5" gutterBottom fontWeight={600}>
              Second Level Modal
            </Typography>
            <Typography variant="body1" color="text.secondary" paragraph>
              This modal is now the primary modal. The first modal has expanded to become the
              secondary modal behind this one. Notice the smooth transition animation when the
              modals change roles. The secondary modal always occupies 100% of the viewport.
            </Typography>

            <Button variant="contained" color="warning" onClick={() => setIsThirdModalOpen(true)}>
              Open Third Modal
            </Button>
          </Box>
        </StackedModal>

        {/* Third Modal */}
        <StackedModal
          open={isThirdModalOpen}
          onClose={() => setIsThirdModalOpen(false)}
          navigationTitle="Third Modal"
          modalId="modal-3"
          actions={
            <Button
              variant="contained"
              color="error"
              size="small"
              onClick={() => {
                setIsThirdModalOpen(false);
                setIsSecondModalOpen(false);
                setIsFirstModalOpen(false);
              }}
            >
              Close All
            </Button>
          }
        >
          <Box sx={{ p: 4 }}>
            <Typography variant="h5" gutterBottom fontWeight={600}>
              Third Level Modal
            </Typography>
            <Typography variant="body1" color="text.secondary" paragraph>
              When this third modal opens, the first modal is removed from the DOM for performance
              optimization. Only the immediate parent (second modal) remains as secondary. This
              ensures smooth performance even with deeply nested workflows.
            </Typography>

            <Paper elevation={1} sx={{ p: 3, mt: 3, bgcolor: 'info.50' }}>
              <Typography variant="subtitle2" color="info.main" gutterBottom>
                Performance Note
              </Typography>
              <Typography variant="body2" color="text.secondary">
                The system only renders a maximum of 2 modals at any time to maintain optimal
                performance. When you close this modal, the second modal will transition back to
                primary, and the first modal will be re-rendered as secondary.
              </Typography>
            </Paper>
          </Box>
        </StackedModal>
      </Box>
    </ModalStackProvider>
  );
};

// Create aliases for convenience
export { ModalStackProvider as StackedModalProvider };
export { useModalStack as useStackedModal };
