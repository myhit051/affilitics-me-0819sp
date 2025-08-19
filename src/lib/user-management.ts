// User management for team usage
export interface User {
    id: string;
    name: string;
    email: string;
    role: 'admin' | 'manager' | 'analyst';
    avatar?: string;
    facebookAccounts: string[];
    permissions: Permission[];
    lastLogin: Date;
    createdAt: Date;
}

export interface Permission {
    resource: 'campaigns' | 'accounts' | 'reports' | 'settings';
    actions: ('read' | 'write' | 'delete')[];
}

export interface Team {
    id: string;
    name: string;
    members: User[];
    settings: TeamSettings;
}

export interface TeamSettings {
    defaultSyncInterval: number;
    allowedDomains: string[];
    dataRetentionDays: number;
    requireApprovalForNewAccounts: boolean;
}

class UserManager {
    private currentUser: User | null = null;
    private team: Team | null = null;
    private isInitialized = false;

    constructor() {
        this.init();
    }

    // Initialize user from localStorage or session
    init() {
        if (this.isInitialized) return;

        try {
            const userData = localStorage.getItem('affilitics_user');
            const teamData = localStorage.getItem('affilitics_team');

            if (userData) {
                const parsedUser = JSON.parse(userData);
                // Convert date strings back to Date objects
                this.currentUser = {
                    ...parsedUser,
                    lastLogin: new Date(parsedUser.lastLogin),
                    createdAt: new Date(parsedUser.createdAt),
                };
            }

            if (teamData) {
                this.team = JSON.parse(teamData);
            }

            // If no user exists, create a demo user for testing
            if (!this.currentUser) {
                this.createDemoUser();
            }

            this.isInitialized = true;
        } catch (error) {
            console.error('Failed to initialize user manager:', error);
            this.createDemoUser();
            this.isInitialized = true;
        }
    }

    // Create demo user for testing
    private createDemoUser() {
        const demoUser: User = {
            id: `demo_${Date.now()}`,
            name: 'Demo User',
            email: 'demo@example.com',
            role: 'admin',
            avatar: undefined,
            facebookAccounts: [],
            permissions: this.getDefaultPermissions('admin'),
            lastLogin: new Date(),
            createdAt: new Date(),
        };

        const demoTeam: Team = {
            id: `team_${Date.now()}`,
            name: 'Demo Team',
            members: [demoUser],
            settings: {
                defaultSyncInterval: 5,
                allowedDomains: ['example.com'],
                dataRetentionDays: 365,
                requireApprovalForNewAccounts: false,
            },
        };

        this.currentUser = demoUser;
        this.team = demoTeam;

        // Save to localStorage
        localStorage.setItem('affilitics_user', JSON.stringify(demoUser));
        localStorage.setItem('affilitics_team', JSON.stringify(demoTeam));
    }

    // Get current user
    getCurrentUser(): User | null {
        if (!this.isInitialized) {
            this.init();
        }
        return this.currentUser;
    }

    // Set current user (after Facebook login)
    setCurrentUser(facebookUser: any): User {
        const user: User = {
            id: facebookUser.id,
            name: facebookUser.name,
            email: facebookUser.email,
            role: this.determineUserRole(facebookUser.email),
            avatar: facebookUser.picture?.data?.url,
            facebookAccounts: [],
            permissions: this.getDefaultPermissions(this.determineUserRole(facebookUser.email)),
            lastLogin: new Date(),
            createdAt: this.currentUser?.createdAt || new Date(),
        };

        this.currentUser = user;
        localStorage.setItem('affilitics_user', JSON.stringify(user));

        return user;
    }

    // Determine user role based on email domain or predefined list
    private determineUserRole(email: string): 'admin' | 'manager' | 'analyst' {
        const adminEmails = ['admin@yourcompany.com']; // Configure this
        const managerEmails = ['manager@yourcompany.com']; // Configure this

        if (adminEmails.includes(email)) return 'admin';
        if (managerEmails.includes(email)) return 'manager';
        return 'analyst';
    }

    // Get default permissions for role
    private getDefaultPermissions(role: 'admin' | 'manager' | 'analyst'): Permission[] {
        const permissions: Record<string, Permission[]> = {
            admin: [
                { resource: 'campaigns', actions: ['read', 'write', 'delete'] },
                { resource: 'accounts', actions: ['read', 'write', 'delete'] },
                { resource: 'reports', actions: ['read', 'write', 'delete'] },
                { resource: 'settings', actions: ['read', 'write', 'delete'] },
            ],
            manager: [
                { resource: 'campaigns', actions: ['read', 'write'] },
                { resource: 'accounts', actions: ['read', 'write'] },
                { resource: 'reports', actions: ['read', 'write'] },
                { resource: 'settings', actions: ['read'] },
            ],
            analyst: [
                { resource: 'campaigns', actions: ['read'] },
                { resource: 'accounts', actions: ['read'] },
                { resource: 'reports', actions: ['read', 'write'] },
                { resource: 'settings', actions: ['read'] },
            ],
        };

        return permissions[role] || permissions.analyst;
    }

    // Check if user has permission
    hasPermission(resource: string, action: string): boolean {
        if (!this.currentUser) return false;

        const permission = this.currentUser.permissions.find(p => p.resource === resource);
        return permission?.actions.includes(action as any) || false;
    }

    // Update user's Facebook accounts
    updateFacebookAccounts(accounts: string[]) {
        if (this.currentUser) {
            this.currentUser.facebookAccounts = accounts;
            localStorage.setItem('affilitics_user', JSON.stringify(this.currentUser));
        }
    }

    // Update last login time
    updateLastLogin() {
        if (this.currentUser) {
            this.currentUser.lastLogin = new Date();
            localStorage.setItem('affilitics_user', JSON.stringify(this.currentUser));
        }
    }

    // Check if user is authenticated
    isAuthenticated(): boolean {
        return this.currentUser !== null;
    }

    // Logout user
    logout() {
        this.currentUser = null;
        this.team = null;
        localStorage.removeItem('affilitics_user');
        localStorage.removeItem('affilitics_team');
        localStorage.removeItem('facebook_token');
        localStorage.removeItem('affiliateData'); // Clear app data
    }

    // Get team info
    getTeam(): Team | null {
        if (!this.isInitialized) {
            this.init();
        }
        return this.team;
    }

    // Set team info
    setTeam(team: Team) {
        this.team = team;
        localStorage.setItem('affilitics_team', JSON.stringify(team));
    }

    // Team permission methods for cloud sync compatibility
    canAccessTeamData(): boolean {
        return this.hasPermission('reports', 'read');
    }

    canUploadData(): boolean {
        return this.hasPermission('reports', 'write');
    }

    canDeleteData(): boolean {
        return this.hasPermission('reports', 'delete');
    }

    canShareData(): boolean {
        return this.hasPermission('reports', 'write');
    }
}

// Export singleton instance
export const userManager = new UserManager();