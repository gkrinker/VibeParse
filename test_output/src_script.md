# Code Explanation Script

## Chapter 1: Files in this chapter (5s)

This chapter covers the following files:
src/App.tsx
src/components/CardActions.tsx
src/components/FileUpload.tsx
src/components/FlashcardStack.tsx
src/components/ProgressBar.tsx
src/components/SettingsDrawer.tsx
src/components/ui/accordion.tsx
src/components/ui/alert-dialog.tsx

---

## Scene 1: Scene 1: Setting Up the App with Providers (30s)

In this scene, we'll explore how the App component is structured with various providers for managing state, notifications, and routing. This foundational setup is vital for a fully functional React application.


### Code Highlights

**src/App.tsx** (lines 11-13):
```
// Initialize React Query client for managing server state
const queryClient = new QueryClient();
```
Here, we initialize a `QueryClient`, which is crucial for managing server state using React Query. Think of it as the manager that handles data fetching and caching.


**src/App.tsx** (lines 16-19):
```
<QueryClientProvider client={queryClient}>
  <TooltipProvider>
    <Toaster />
    <Sonner />
```
These lines wrap the app in various context providers. The `QueryClientProvider` uses the `queryClient` for data management, while `TooltipProvider` and `Toaster` are for tooltips and notifications respectively. It's like setting the stage with all necessary props before the show starts.



---

## Scene 2: Scene 2: Navigating the App with React Router (25s)

Next, we'll delve into how routing is set up, allowing users to navigate between different pages of the application.


### Code Highlights

**src/App.tsx** (lines 22-30):
```
<BrowserRouter>
  <Routes>
    <Route path="/" element={<Index />} />
    <Route path="/flashcards" element={<FlashcardViewer />} />
    <Route path="*" element={<NotFound />} />
  </Routes>
</BrowserRouter>
```
This block establishes the routing structure using `BrowserRouter`, `Routes`, and `Route`. Each `Route` component specifies a path and the component to render. It's like a GPS, directing users to the right page based on the URL.



---

## Scene 3: Scene 3: Understanding CardActions Component (30s)

We now shift focus to the `CardActions` component, which provides interactive actions for each flashcard, such as bookmarking or asking AI questions.


### Code Highlights

**src/components/CardActions.tsx** (lines 14-16):
```
const [aiQuestion, setAiQuestion] = useState("");
const [aiResponse, setAiResponse] = useState("");
const [isAskingAI, setIsAskingAI] = useState(false);
```
These lines define state variables using React hooks to manage the AI interaction status and responses. `useState` acts like a personal assistant, tracking the current state of each variable.


**src/components/CardActions.tsx** (lines 32-38):
```
const handleAskAI = async () => {
  if (!aiQuestion.trim()) return;

  setIsAskingAI(true);
  try {
    // Simulate AI response for now
    await new Promise(resolve => setTimeout(resolve, 1500));
    setAiResponse(`Based on the content, ${aiQuestion.toLowerCase()}... This is a simulated AI response that would provide contextual information about the current card content.`);
    onAskAI(cardId, aiQuestion);
  } finally {
    setIsAskingAI(false);
  }
};
```
This function handles the AI question submission. It simulates an AI response with a delay, akin to waiting for a machine to process and return information.



---

## Scene 4: Scene 4: File Upload Process in FileUpload Component (30s)

Let's look at how the `FileUpload` component manages file selection, validation, and uploading.


### Code Highlights

**src/components/FileUpload.tsx** (lines 24-26):
```
const [selectedFile, setSelectedFile] = useState<File | null>(null);
const [isDragging, setIsDragging] = useState(false);
const [error, setError] = useState<string | null>(null);
```
These states track the file selection, drag status, and any errors. It's like having a checklist to ensure everything is ready before uploading a file.


**src/components/FileUpload.tsx** (lines 42-50):
```
const validateFile = (file: File): boolean => {
  const validTypes = ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'];
  if (!validTypes.includes(file.type)) {
    setError('Please upload a PDF or Word document');
    return false;
  }
  const maxSize = 10 * 1024 * 1024; // 10MB in bytes
  if (file.size > maxSize) {
    setError('File size must be less than 10MB');
    return false;
  }

  setError(null);
  return true;
};
```
This `validateFile` function checks the type and size of the file. Consider it the security check at an airport, ensuring only valid files proceed to the upload stage.



---

## Scene 5: Scene 5: Managing Progress with ProgressBar (25s)

Finally, we explore the `ProgressBar` component, which visually represents progress through flashcards or tasks.


### Code Highlights

**src/components/ProgressBar.tsx** (lines 16-18):
```
const progress = (current / total) * 100;
const completion = (answered / total) * 100;
```
These calculations determine the percentage of progress and completion. Imagine a race track where these values show how far you've advanced towards the finish line.


**src/components/ProgressBar.tsx** (lines 22-26):
```
<div className="relative h-1 bg-gray-200 rounded-full overflow-hidden">
  <div className="absolute top-0 left-0 h-full bg-gradient-to-r from-purple-600 to-blue-600 transition-all duration-300" style={{ width: `${progress}%` }} />
  <div className="absolute top-0 left-0 h-full bg-gray-400 transition-all duration-300" style={{ width: `${completion}%` }} />
</div>
```
Here, the `ProgressBar` visually reflects the progress and completion through colored bars. Think of it as a visual motivator, showing how close you are to achieving your goal.


---

## Chapter 2: Files in this chapter (5s)

This chapter covers the following files:
src/components/ui/alert.tsx
src/components/ui/aspect-ratio.tsx
src/components/ui/avatar.tsx
src/components/ui/badge.tsx
src/components/ui/breadcrumb.tsx
src/components/ui/button.tsx
src/components/ui/calendar.tsx
src/components/ui/card.tsx
src/components/ui/carousel.tsx
src/components/ui/chart.tsx
src/components/ui/checkbox.tsx
src/components/ui/collapsible.tsx
src/components/ui/command.tsx

---

## Scene 6: Scene 1: Understanding Alert Variants (30s)

In this scene, we will explore how the alert component is styled and how different styles can be applied using variants.


### Code Highlights

**alert.tsx** (lines 6-18):
```
const alertVariants = cva(
  "relative w-full rounded-lg border p-4 [&>svg~*]:pl-7 [&>svg+div]:translate-y-[-3px] [&>svg]:absolute [&>svg]:left-4 [&>svg]:top-4 [&>svg]:text-foreground",
  {
    variants: {
      variant: {
        default: "bg-background text-foreground",
        destructive:
          "border-destructive/50 text-destructive dark:border-destructive [&>svg]:text-destructive",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
)
```
Here, `alertVariants` is defined using the `cva` function, which helps create class variance authority (CVA) objects. The `alertVariants` object allows the alert component to have different styles based on the `variant` property. By default, the alert uses the `default` variant, but it can also be styled as `destructive` if specified.



---

## Scene 7: Scene 2: Forwarding Refs in Alert Components (25s)

Let's see how React's `forwardRef` is used in the `Alert`, `AlertTitle`, and `AlertDescription` components to manage refs and props.


### Code Highlights

**alert.tsx** (lines 20-26):
```
const Alert = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement> & VariantProps<typeof alertVariants>
>(({ className, variant, ...props }, ref) => (
  <div
    ref={ref}
    role="alert"
    className={cn(alertVariants({ variant }), className)}
    {...props}
  />
))
Alert.displayName = "Alert"
```
The `Alert` component uses `React.forwardRef` to pass a `ref` to the underlying DOM element. This allows parent components to directly interact with the DOM node. The `cn` function combines the styles from `alertVariants` with any additional classes.


**alert.tsx** (lines 28-33):
```
const AlertTitle = React.forwardRef<
  HTMLParagraphElement,
  React.HTMLAttributes<HTMLHeadingElement>
>(({ className, ...props }, ref) => (
  <h5
    ref={ref}
    className={cn("mb-1 font-medium leading-none tracking-tight", className)}
    {...props}
  />
))
AlertTitle.displayName = "AlertTitle"
```
Similarly, `AlertTitle` also uses `forwardRef` for its `h5` element, enabling the usage of refs for more precise control over the component.



---

## Scene 8: Scene 3: Building the Badge Component with Variants (30s)

Now, let's switch gears and look at the badge component, which also uses the CVA for styling with variants.


### Code Highlights

**badge.tsx** (lines 6-16):
```
const badgeVariants = cva(
  "inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2",
  {
    variants: {
      variant: {
        default: "border-transparent bg-primary text-primary-foreground hover:bg-primary/80",
        secondary: "border-transparent bg-secondary text-secondary-foreground hover:bg-secondary/80",
        destructive: "border-transparent bg-destructive text-destructive-foreground hover:bg-destructive/80",
        outline: "text-foreground",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
)
```
The `badgeVariants` object is created using the `cva` function, similar to the alert component. It defines multiple variant styles for different use cases such as `default`, `secondary`, `destructive`, and `outline`. These styles can be applied dynamically based on the `variant` prop.



---

## Scene 9: Scene 4: Creating the Badge Component (25s)

Let's see how the `Badge` component is constructed and how it utilizes the `badgeVariants`.


### Code Highlights

**badge.tsx** (lines 18-24):
```
export interface BadgeProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof badgeVariants> {}

function Badge({ className, variant, ...props }: BadgeProps) {
  return (
    <div className={cn(badgeVariants({ variant }), className)} {...props} />
  )
}
```
The `Badge` component is a simple functional component that applies styles using the `badgeVariants` object. It accepts `className`, `variant`, and other props, and uses the `cn` function to combine the styles for the badge.



---

## Scene 10: Scene 5: Understanding Avatar Component Structure (30s)

Finally, let's take a glance at the avatar component to understand its structure and styling.


### Code Highlights

**avatar.tsx** (lines 8-16):
```
const Avatar = React.forwardRef<
  React.ElementRef<typeof AvatarPrimitive.Root>,
  React.ComponentPropsWithoutRef<typeof AvatarPrimitive.Root>
>(({ className, ...props }, ref) => (
  <AvatarPrimitive.Root
    ref={ref}
    className={cn(
      "relative flex h-10 w-10 shrink-0 overflow-hidden rounded-full",
      className
    )}
    {...props}
  />
))
Avatar.displayName = AvatarPrimitive.Root.displayName
```
The `Avatar` component uses `React.forwardRef` to pass refs, and it integrates with `AvatarPrimitive.Root` from the `@radix-ui/react-avatar` library. It applies styles to make the avatar round and responsive, using the `cn` function to handle class names dynamically.


By breaking down these components, we see a consistent pattern of using React's `forwardRef` and CVA for styling, making the components both flexible and maintainable.

---

## Chapter 3: Files in this chapter (5s)

This chapter covers the following files:
src/components/ui/context-menu.tsx
src/components/ui/dialog.tsx
src/components/ui/drawer.tsx
src/components/ui/dropdown-menu.tsx
src/components/ui/form.tsx
src/components/ui/hover-card.tsx
src/components/ui/input-otp.tsx
src/components/ui/input.tsx
src/components/ui/label.tsx
src/components/ui/menubar.tsx

---

## Scene 11: Scene 1: Setting the Stage with Imports (20s)

Let's start by looking at the imports in our `context-menu.tsx` file. This file imports several libraries and components, which are essential for creating our context menu.


### Code Highlights

**src/components/ui/context-menu.tsx** (lines 1-5):
```
import * as React from "react"
import * as ContextMenuPrimitive from "@radix-ui/react-context-menu"
import { Check, ChevronRight, Circle } from "lucide-react"
import { cn } from "@/lib/utils"
```
Here, we're importing React, which is the backbone of our component. The `@radix-ui/react-context-menu` provides us with primitives to build a context menu, while `lucide-react` offers some icons. The `cn` utility helps manage class names.



---

## Scene 12: Scene 2: Understanding the Context Menu Structure (25s)

Now, let's dive into how we define the various parts of a context menu. We use Radix UI primitives to create and export several components.


### Code Highlights

**src/components/ui/context-menu.tsx** (lines 7-15):
```
const ContextMenu = ContextMenuPrimitive.Root
const ContextMenuTrigger = ContextMenuPrimitive.Trigger
const ContextMenuGroup = ContextMenuPrimitive.Group
const ContextMenuPortal = ContextMenuPrimitive.Portal
const ContextMenuSub = ContextMenuPrimitive.Sub
const ContextMenuRadioGroup = ContextMenuPrimitive.RadioGroup
```
Each line assigns a Radix UI primitive to a variable, which represents a different part of the context menu, like the root, trigger, group, and more. Think of these as the building blocks of our menu.



---

## Scene 13: Scene 3: Customizing Sub Triggers and Content (30s)

Here, we define custom sub trigger and content components that allow for additional styling and functionality.


### Code Highlights

**src/components/ui/context-menu.tsx** (lines 17-35):
```
const ContextMenuSubTrigger = React.forwardRef<
  React.ElementRef<typeof ContextMenuPrimitive.SubTrigger>,
  React.ComponentPropsWithoutRef<typeof ContextMenuPrimitive.SubTrigger> & {
    inset?: boolean
  }
>(({ className, inset, children, ...props }, ref) => (
  <ContextMenuPrimitive.SubTrigger
    ref={ref}
    className={cn(
      "flex cursor-default select-none items-center rounded-sm px-2 py-1.5 text-sm outline-none focus:bg-accent focus:text-accent-foreground data-[state=open]:bg-accent data-[state=open]:text-accent-foreground",
      inset && "pl-8",
      className
    )}
    {...props}
  >
    {children}
    <ChevronRight className="ml-auto h-4 w-4" />
  </ContextMenuPrimitive.SubTrigger>
))
ContextMenuSubTrigger.displayName = ContextMenuPrimitive.SubTrigger.displayName
```
The `ContextMenuSubTrigger` is a custom component that allows for adding a submenu. It's styled with classes for appearance and behavior, like changing color on focus or when open. The `ChevronRight` icon visually indicates a submenu.



---

## Scene 14: Scene 4: Leveraging Context for Form Fields (25s)

Let's transition to the `form.tsx` file, where context is used to manage form fields.


### Code Highlights

**src/components/ui/form.tsx** (lines 14-19):
```
const FormFieldContext = React.createContext<FormFieldContextValue>(
  {} as FormFieldContextValue
)

const FormField = <
  TFieldValues extends FieldValues = FieldValues,
  TName extends FieldPath<TFieldValues> = FieldPath<TFieldValues>
>({
  ...props
}: ControllerProps<TFieldValues, TName>) => {
  return (
    <FormFieldContext.Provider value={{ name: props.name }}>
      <Controller {...props} />
    </FormFieldContext.Provider>
  )
}
```
The `FormFieldContext` is created to pass down field names through context. The `FormField` component uses this context to wrap a `Controller`, linking form logic and UI.



---

## Scene 15: Scene 5: Integrating Input Components (20s)

Finally, let's look at a simple input component.


### Code Highlights

**src/components/ui/input.tsx** (lines 3-12):
```
const Input = React.forwardRef<HTMLInputElement, React.ComponentProps<"input">>(
  ({ className, type, ...props }, ref) => {
    return (
      <input
        type={type}
        className={cn(
          "flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-base ring-offset-background",
          className
        )}
        ref={ref}
        {...props}
      />
    )
  }
)
Input.displayName = "Input"
```
This component defines an input field with customizable styling. The `cn` utility helps combine class names for responsiveness and visuals. It uses `forwardRef` to allow parent components to access the input's DOM node.


Through these scenes, we've explored the foundational aspects of building and styling UI components using React, Radix UI, and utility libraries. Keep experimenting to make these components your own!

---

## Chapter 4: Files in this chapter (5s)

This chapter covers the following files:
src/components/ui/navigation-menu.tsx
src/components/ui/pagination.tsx
src/components/ui/popover.tsx
src/components/ui/progress.tsx
src/components/ui/radio-group.tsx
src/components/ui/resizable.tsx
src/components/ui/scroll-area.tsx
src/components/ui/select.tsx
src/components/ui/separator.tsx
src/components/ui/sheet.tsx

---

## Scene 16: Scene 1: Introduction to Navigation Menu (30s)

Let's begin by exploring the `NavigationMenu` component. This component is a part of a UI library that helps in creating a navigation menu. It's built using React and leverages a library called `@radix-ui/react-navigation-menu` for managing navigation primitives.


### Code Highlights

**src/components/ui/navigation-menu.tsx** (lines 8-20):
```
const NavigationMenu = React.forwardRef<
  React.ElementRef<typeof NavigationMenuPrimitive.Root>,
  React.ComponentPropsWithoutRef<typeof NavigationMenuPrimitive.Root>
>(({ className, children, ...props }, ref) => (
  <NavigationMenuPrimitive.Root
    ref={ref}
    className={cn(
      "relative z-10 flex max-w-max flex-1 items-center justify-center",
      className
    )}
    {...props}
  >
    {children}
    <NavigationMenuViewport />
  </NavigationMenuPrimitive.Root>
))
```
This code defines a React component called `NavigationMenu` using `React.forwardRef`, which allows the component to pass a `ref` down to a child component. The `NavigationMenu` uses a `Root` component from `NavigationMenuPrimitive` and applies styling using a utility called `cn`.



---

## Scene 17: Scene 2: Understanding Forward Refs (25s)

Forward refs in React are a pattern for passing a ref through a component to one of its children. Here, it's used to connect the `NavigationMenu` component to the DOM element rendered by `NavigationMenuPrimitive.Root`.


### Code Highlights

**src/components/ui/navigation-menu.tsx** (lines 10-12):
```
ref={ref}
```
This line shows how the `ref` is passed down to the `NavigationMenuPrimitive.Root`, allowing parent components to access the underlying DOM node if needed.



---

## Scene 18: Scene 3: Styling with Class Variance Authority (30s)

The `cn` function and `cva` utility are used for styling components. They enable the composition of CSS class names based on certain conditions or variants.


### Code Highlights

**src/components/ui/navigation-menu.tsx** (lines 46-49):
```
const navigationMenuTriggerStyle = cva(
  "group inline-flex h-10 w-max items-center justify-center rounded-md bg-background px-4 py-2 text-sm font-medium transition-colors hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground focus:outline-none disabled:pointer-events-none disabled:opacity-50 data-[active]:bg-accent/50 data-[state=open]:bg-accent/50"
)
```
The `cva` function is used here to define a base style for a menu trigger. It supports conditional logic for styling based on the component's state or props.



---

## Scene 19: Scene 4: Creating Interactive Components (30s)

The `NavigationMenuTrigger` component adds interactivity. It shows how icons and animations are integrated into the trigger.


### Code Highlights

**src/components/ui/navigation-menu.tsx** (lines 51-62):
```
const NavigationMenuTrigger = React.forwardRef<
  React.ElementRef<typeof NavigationMenuPrimitive.Trigger>,
  React.ComponentPropsWithoutRef<typeof NavigationMenuPrimitive.Trigger>
>(({ className, children, ...props }, ref) => (
  <NavigationMenuPrimitive.Trigger
    ref={ref}
    className={cn(navigationMenuTriggerStyle(), "group", className)}
    {...props}
  >
    {children}{" "}
    <ChevronDown
      className="relative top-[1px] ml-1 h-3 w-3 transition duration-200 group-data-[state=open]:rotate-180"
      aria-hidden="true"
    />
  </NavigationMenuPrimitive.Trigger>
))
```
This component includes a `ChevronDown` icon, which rotates based on the menu's state, providing visual feedback to users when the menu is opened or closed.



---

## Scene 20: Scene 5: Conclusion and Exports (20s)

Finally, let's look at how components are exported for use in other parts of the application. This file exports multiple components related to the navigation menu.


### Code Highlights

**src/components/ui/navigation-menu.tsx** (lines 129-136):
```
export {
  navigationMenuTriggerStyle,
  NavigationMenu,
  NavigationMenuList,
  NavigationMenuItem,
  NavigationMenuContent,
  NavigationMenuTrigger,
  NavigationMenuLink,
  NavigationMenuIndicator,
  NavigationMenuViewport,
}
```
This export statement makes the `NavigationMenu` components available for import in other files, organizing them into a modular structure that can be reused throughout the application.


By breaking down the code in this way, we've explored the main concepts behind creating a flexible, styled, and interactive navigation menu using React and Radix UI primitives.

---

## Chapter 5: Files in this chapter (5s)

This chapter covers the following files:
src/components/ui/sidebar.tsx
src/components/ui/skeleton.tsx
src/components/ui/slider.tsx
src/components/ui/sonner.tsx
src/components/ui/switch.tsx
src/components/ui/table.tsx
src/components/ui/tabs.tsx
src/components/ui/textarea.tsx
src/components/ui/toast.tsx
src/components/ui/toaster.tsx
src/components/ui/toggle-group.tsx

---

## Scene 21: Introduction to Sidebar Context (30s)

In this scene, we'll explore the context and state management for the Sidebar component. We'll see how the sidebar's state is maintained and shared across various components.


### Code Highlights

**sidebar.tsx** (lines 24-30):
```
type SidebarContext = {
  state: "expanded" | "collapsed"
  open: boolean
  setOpen: (open: boolean) => void
  openMobile: boolean
  setOpenMobile: (open: boolean) => void
  isMobile: boolean
  toggleSidebar: () => void
}

const SidebarContext = React.createContext<SidebarContext | null>(null)
```
This code defines a type `SidebarContext` that includes properties to manage the sidebar's open/closed state, mobile state, and a toggle function. The `React.createContext` function creates a context to share this state throughout the component tree.



---

## Scene 22: Using the Sidebar Context (25s)

Next, let's see how the sidebar context is utilized within the component.


### Code Highlights

**sidebar.tsx** (lines 32-41):
```
function useSidebar() {
  const context = React.useContext(SidebarContext)
  if (!context) {
    throw new Error("useSidebar must be used within a SidebarProvider.")
  }

  return context
}
```
The `useSidebar` hook allows components to access the sidebar state and control functions. It ensures that the context is used within a `SidebarProvider`, throwing an error if it's not.



---

## Scene 23: Controlling the Sidebar State (30s)

Let's dive into how the sidebar's state is controlled and maintained, including the use of cookies.


### Code Highlights

**sidebar.tsx** (lines 67-83):
```
const [_open, _setOpen] = React.useState(defaultOpen)
const open = openProp ?? _open
const setOpen = React.useCallback(
  (value: boolean | ((value: boolean) => boolean)) => {
    const openState = typeof value === "function" ? value(open) : value
    if (setOpenProp) {
      setOpenProp(openState)
    } else {
      _setOpen(openState)
    }

    document.cookie = `${SIDEBAR_COOKIE_NAME}=${openState}; path=/; max-age=${SIDEBAR_COOKIE_MAX_AGE}`
  },
  [setOpenProp, open]
)
```
Here, the sidebar's open state is managed using local state and optionally controlled by external props. Changes to the sidebar state are saved in a cookie for persistence.



---

## Scene 24: Adding Interactivity with Keyboard Shortcuts (20s)

We'll look at how keyboard shortcuts are implemented to toggle the sidebar.


### Code Highlights

**sidebar.tsx** (lines 85-97):
```
React.useEffect(() => {
  const handleKeyDown = (event: KeyboardEvent) => {
    if (
      event.key === SIDEBAR_KEYBOARD_SHORTCUT &&
      (event.metaKey || event.ctrlKey)
    ) {
      event.preventDefault()
      toggleSidebar()
    }
  }

  window.addEventListener("keydown", handleKeyDown)
  return () => window.removeEventListener("keydown", handleKeyDown)
}, [toggleSidebar])
```
This effect listens for specific keyboard shortcuts and toggles the sidebar's state when triggered, providing a more interactive experience.



---

## Scene 25: Rendering the Sidebar (25s)

Finally, let's see how the Sidebar is rendered and styled based on its state.


### Code Highlights

**sidebar.tsx** (lines 145-168):
```
return (
  <div
    ref={ref}
    className="group peer hidden md:block text-sidebar-foreground"
    data-state={state}
    data-collapsible={state === "collapsed" ? collapsible : ""}
    data-variant={variant}
    data-side={side}
  >
    <div
      className={cn(
        "duration-200 relative h-svh w-[--sidebar-width] bg-transparent transition-[width] ease-linear",
        "group-data-[collapsible=offcanvas]:w-0",
        "group-data-[side=right]:rotate-180",
        variant === "floating" || variant === "inset"
          ? "group-data-[collapsible=icon]:w-[calc(var(--sidebar-width-icon)_+_theme(spacing.4))]"
          : "group-data-[collapsible=icon]:w-[--sidebar-width-icon]"
      )}
    />
    <div
      className={cn(
        "duration-200 fixed inset-y-0 z-10 hidden h-svh w-[--sidebar-width] transition-[left,right,width] ease-linear md:flex",
        side === "left"
          ? "left-0 group-data-[collapsible=offcanvas]:left-[calc(var(--sidebar-width)*-1)]"
          : "right-0 group-data-[collapsible=offcanvas]:right-[calc(var(--sidebar-width)*-1)]",
        variant === "floating" || variant === "inset"
          ? "p-2 group-data-[collapsible=icon]:w-[calc(var(--sidebar-width-icon)_+_theme(spacing.4)_+2px)]"
          : "group-data-[collapsible=icon]:w-[--sidebar-width-icon] group-data-[side=left]:border-r group-data-[side=right]:border-l",
        className
      )}
      {...props}
    >
      <div
        data-sidebar="sidebar"
        className="flex h-full w-full flex-col bg-sidebar group-data-[variant=floating]:rounded-lg group-data-[variant=floating]:border group-data-[variant=floating]:border-sidebar-border group-data-[variant=floating]:shadow"
      >
        {children}
      </div>
    </div>
  </div>
)
```
The sidebar's rendering logic adapts based on its state, side, and variant. It uses CSS classes to manage transitions, animations, and responsive behavior.


By understanding these core scenes, you can see how the Sidebar component in a React application manages state, interactivity, and rendering.

---

## Chapter 6: Files in this chapter (5s)

This chapter covers the following files:
src/components/ui/toggle.tsx
src/components/ui/tooltip.tsx
src/components/ui/use-toast.ts
src/hooks/use-mobile.tsx
src/hooks/use-toast.ts
src/lib/utils.ts
src/main.tsx
src/pages/FlashcardViewer.tsx
src/pages/Index.tsx
src/pages/NotFound.tsx
src/services/documentProcessor.test.ts
src/services/documentProcessor.ts
src/vite-env.d.ts

---

## Scene 26: Scene 1: Introduction to Toggle Component (20s)

Let's dive into the `toggle.tsx` file which defines a customizable Toggle component using React and Radix UI's Toggle primitive. This component allows developers to easily integrate toggle buttons with various styles and sizes.


### Code Highlights

**toggle.tsx** (lines 1-3):
```
import * as React from "react"
import * as TogglePrimitive from "@radix-ui/react-toggle"
import { cva, type VariantProps } from "class-variance-authority"
```
Here, we import React, Radix UI's Toggle primitive, and utilities from `class-variance-authority` to manage styling variations.



---

## Scene 27: Scene 2: Defining Toggle Variants (25s)

The next part of our code involves defining the different styling variants for our Toggle component using the `cva` function.


### Code Highlights

**toggle.tsx** (lines 7-27):
```
const toggleVariants = cva(
  "inline-flex items-center justify-center rounded-md text-sm font-medium ring-offset-background transition-colors hover:bg-muted hover:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 data-[state=on]:bg-accent data-[state=on]:text-accent-foreground",
  {
    variants: {
      variant: {
        default: "bg-transparent",
        outline: "border border-input bg-transparent hover:bg-accent hover:text-accent-foreground",
      },
      size: {
        default: "h-10 px-3",
        sm: "h-9 px-2.5",
        lg: "h-11 px-5",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
)
```
The `toggleVariants` function defines default styles and allows customization for different sizes and variants, like `default` and `outline`.



---

## Scene 28: Scene 3: Creating the Toggle Component (30s)

Now, let's see how we wrap these variants into a React component using `forwardRef`.


### Code Highlights

**toggle.tsx** (lines 29-39):
```
const Toggle = React.forwardRef<
  React.ElementRef<typeof TogglePrimitive.Root>,
  React.ComponentPropsWithoutRef<typeof TogglePrimitive.Root> & VariantProps<typeof toggleVariants>
>(({ className, variant, size, ...props }, ref) => (
  <TogglePrimitive.Root
    ref={ref}
    className={cn(toggleVariants({ variant, size, className }))}
    {...props}
  />
))
```
The `Toggle` component uses `forwardRef` for ref forwarding, and it applies the computed class names from `toggleVariants` using a utility function `cn`. This pattern allows for the seamless integration of styles and props.



---

## Scene 29: Scene 4: Exporting the Toggle Component (15s)

Finally, the component and its variants are exported for use in other parts of the application.

```tsx
Toggle.displayName = TogglePrimitive.Root.displayName
```
```tsx
export { Toggle, toggleVariants }
```
These lines set the display name for better debugging and export the Toggle component and its variants so they can be used throughout the application.

---

