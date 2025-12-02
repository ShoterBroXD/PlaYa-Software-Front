import { Component, OnInit, signal, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { CommunityService } from '../../../core/services/community.service';
import { ThreadService } from '../../../core/services/thread.service';
import { AuthService } from '../../../core/services/auth.service';
import { CommunityResponseDto, UserResponseDto, ThreadRequestDto, ThreadResponseDto, CommentRequestDto, CommentResponseDto } from '../../../core/models/community.model';

@Component({
  selector: 'app-community-detail',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './community-detail.component.html',
  styleUrls: ['./community-detail.component.css']
})
export class CommunityDetailComponent implements OnInit {
  activeTab = signal<'posts' | 'members' | 'about'>('posts');
  communityId: number | null = null;
  currentUserId: number | null = null;
  isLoading = true;
  isJoining = false;
  isCreatingPost = false;
  error: string | null = null;

  newPost = {
    title: '',
    content: ''
  };

  community: any = {
    id: -1,
    name: '',
    followers: '0',
    description: '',
    image: '/assets/img/images/perfil-comunidades.png',
    postsCount: '0',
    createdYear: ''
  };
  posts: any[] = [];
  threads: ThreadResponseDto[] = [];
  members: any[] = [];
  isUserMember = false;
  showPostForm = false;
  expandedPostId: number | null = null;
  newComment: { [postId: number]: string } = {};
  postComments: { [postId: number]: any[] } = {};
  loadingComments: { [postId: number]: boolean } = {};

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private communityService: CommunityService,
    private threadService: ThreadService,
    private authService: AuthService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit() {
    // Obtener currentUserId
    this.currentUserId = this.authService.getUserId();

    // Si no hay userId en localStorage, intentar obtenerlo del currentUser
    if (!this.currentUserId) {
      const currentUser = this.authService.getCurrentUser();
      if (currentUser && currentUser.idUser) {
        this.currentUserId = currentUser.idUser;
        // Guardarlo para futuras referencias
        localStorage.setItem('userId', currentUser.idUser.toString());
        console.log('userId obtenido del currentUser y guardado:', this.currentUserId);
      }
    }

    console.log('ngOnInit - currentUserId:', this.currentUserId);

    // Verificar token
    const token = this.authService.getToken();
    console.log('ngOnInit - token existe:', !!token);

    // Solo advertir si no hay autenticación, pero permitir ver la comunidad
    if (!token || !this.currentUserId) {
      console.warn('Usuario no completamente autenticado. Token:', !!token, 'UserId:', this.currentUserId);
      console.warn('Algunas funciones pueden no estar disponibles.');
    }

    const id = this.route.snapshot.paramMap.get('id');
    console.log('ngOnInit - route id:', id);

    if (id) {
      this.communityId = parseInt(id);
      console.log('ngOnInit - communityId parseado:', this.communityId);
      this.loadCommunityDetail();
    } else {
      this.error = 'ID de comunidad no valido';
      this.isLoading = false;
    }
  }

  loadCommunityDetail() {
    if (!this.communityId) {
      console.error('loadCommunityDetail - communityId es null');
      return;
    }

    console.log('Iniciando carga para ID:', this.communityId);
    this.isLoading = true;
    console.log('isLoading establecido a:', this.isLoading);

    // Timeout de seguridad - si no responde en 3s, mostrar error
    const timeoutId = setTimeout(() => {
      if (this.isLoading) {
        console.warn('TIMEOUT: Forzando fin de carga despues de 10s');
        this.isLoading = false;
        this.error = 'Timeout al cargar la comunidad. Verifica la conexión con el backend en Render';
        this.cdr.detectChanges();
      }
    }, 10000);

    console.log('Llamando a getCommunityById...');
    this.communityService.getCommunityById(this.communityId).subscribe({
      next: (community: CommunityResponseDto) => {
        console.log('Respuesta recibida:', community);
        clearTimeout(timeoutId);

        this.community = {
          id: community.idCommunity,
          name: community.name,
          followers: community.members?.length ? `${community.members.length}` : '0',
          description: community.description,
          image: '/assets/img/images/perfil-comunidades.png',
          postsCount: '0',
          createdYear: new Date(community.creationDate).getFullYear().toString()
        };

        // Mapear miembros
        this.members = community.members?.map(member => ({
          id: member.idUser,
          name: member.name,
          role: 'Miembro',
          avatar: '/assets/img/icons/user.png'
        })) || [];

        // Verificar si el usuario es miembro
        this.isUserMember = community.members?.some(m => m.idUser === this.currentUserId) || false;

        this.isLoading = false;
        this.error = null;

        console.log('Datos procesados:');
        console.log('   - community.id:', this.community.id);
        console.log('   - community.name:', this.community.name);
        console.log('   - isLoading:', this.isLoading);
        console.log('   - isUserMember:', this.isUserMember);
        console.log('   - members.length:', this.members.length);

        // Cargar publicaciones solo si el usuario es miembro
        if (this.isUserMember) {
          console.log('Usuario es miembro, cargando publicaciones...');
          this.loadPosts();
        } else {
          console.log('Usuario NO es miembro, no se cargan publicaciones');
          this.posts = [];
        }

        this.cdr.detectChanges();
        console.log('detectChanges ejecutado');
      },
      error: (error) => {
        clearTimeout(timeoutId);
        console.error('Error cargando comunidad:', error);
        this.error = 'Error al cargar la comunidad. Por favor, intenta de nuevo.';
        this.isLoading = false;
        this.cdr.detectChanges();
      }
    });
  }

  joinCommunity() {
    console.log('joinCommunity llamado');
    console.log('communityId:', this.communityId);
    console.log('currentUserId:', this.currentUserId);
    console.log('isUserMember:', this.isUserMember);
    console.log('isJoining:', this.isJoining);

    if (!this.communityId || !this.currentUserId || this.isUserMember) {
      console.warn('No se puede unir:', {
        communityId: this.communityId,
        currentUserId: this.currentUserId,
        isUserMember: this.isUserMember
      });
      return;
    }

    this.isJoining = true;
    console.log('Intentando unirse a comunidad:', this.communityId, 'Usuario:', this.currentUserId);

    this.communityService.joinCommunity(this.communityId, this.currentUserId).subscribe({
      next: () => {
        console.log('Unido exitosamente a la comunidad');
        this.isUserMember = true;

        // Actualizar contador de seguidores
        const currentFollowers = parseInt(this.community.followers) || 0;
        this.community.followers = (currentFollowers + 1).toString();

        // Anadir usuario actual a la lista de miembros
        this.members.push({
          id: this.currentUserId!,
          name: 'Tu',
          role: 'Miembro',
          avatar: '/assets/img/icons/user.png'
        });

        this.isJoining = false;
        console.log('Estado actualizado - isUserMember:', this.isUserMember, 'isJoining:', this.isJoining);

        // Cargar publicaciones después de unirse
        this.loadPosts();

        this.cdr.detectChanges();
        console.log('UI actualizada después de unirse');
      },
      error: (error) => {
        console.error('Error al unirse a la comunidad:', error);
        alert('Error al unirse a la comunidad: ' + error.message);
        this.isJoining = false;
        this.cdr.detectChanges();
      }
    });
  }

  loadPosts() {
    if (!this.communityId) return;

    console.log('Cargando publicaciones de la comunidad:', this.communityId);
    console.log('isUserMember:', this.isUserMember);

    // Por ahora, no intentar cargar desde el backend si da error
    // Los posts se crearán cuando el usuario publique algo nuevo
    this.posts = [];
    this.community.postsCount = '0';
    console.log('Posts inicializados vacíos - el usuario puede crear nuevos');
    this.cdr.detectChanges();

    /* Comentado temporalmente hasta que el backend esté configurado
    this.threadService.getThreadsByCommunityId(this.communityId).subscribe({
      next: (threads: ThreadResponseDto[]) => {
        console.log('Publicaciones recibidas:', threads);
        this.threads = threads;

        this.posts = threads.map(thread => {
          const member = this.members.find(m => m.id === thread.idUser);
          return {
            id: thread.idThread,
            author: member?.name || 'Usuario',
            time: this.getTimeAgo(thread.creationDate),
            content: thread.content,
            title: thread.title,
            likes: 0,
            comments: 0,
            avatar: member?.avatar || '/assets/img/icons/user.png'
          };
        });

        this.community.postsCount = this.posts.length.toString();
        console.log('Posts procesados:', this.posts.length);
        this.cdr.detectChanges();
      },
      error: (error) => {
        console.error('Error cargando publicaciones:', error);
        if (error.message.includes('403')) {
          console.warn('Error 403: Usuario no tiene permisos para ver publicaciones');
          this.posts = [];
        } else {
          console.error('Error al cargar publicaciones:', error.message);
          this.posts = [];
        }
        this.cdr.detectChanges();
      }
    });
    */
  }

  togglePostForm() {
    if (!this.isUserMember) {
      alert('Debes unirte a la comunidad para poder publicar');
      return;
    }
    this.showPostForm = !this.showPostForm;
    if (!this.showPostForm) {
      this.newPost = { title: '', content: '' };
    }
  }

  createPost() {
    if (!this.currentUserId || !this.communityId) {
      alert('Debes iniciar sesion para publicar');
      return;
    }

    if (!this.newPost.title.trim() || !this.newPost.content.trim()) {
      alert('Por favor completa todos los campos');
      return;
    }

    if (!this.isUserMember) {
      alert('Debes unirte a la comunidad para poder publicar');
      return;
    }

    this.isCreatingPost = true;

    const threadData: ThreadRequestDto = {
      idUser: this.currentUserId,
      idCommunity: this.communityId,
      title: this.newPost.title.trim(),
      content: this.newPost.content.trim()
    };

    this.threadService.createThread(threadData).subscribe({
      next: (thread: ThreadResponseDto) => {
        console.log('Thread creado:', thread);

        // Anadir el nuevo post a la lista local
        const user = this.members.find(m => m.id === this.currentUserId);
        this.posts.unshift({
          id: thread.idThread,
          author: user?.name || 'Usuario',
          time: 'Justo ahora',
          content: thread.content,
          title: thread.title,
          likes: 0,
          comments: 0,
          avatar: '/assets/img/icons/user.png'
        });

        // Actualizar contador
        this.community.postsCount = this.posts.length.toString();

        // Limpiar formulario
        this.newPost = { title: '', content: '' };
        this.showPostForm = false;
        this.isCreatingPost = false;

        this.cdr.detectChanges();
      },
      error: (error) => {
        console.error('Error creando post:', error);
        alert('Error al crear la publicacion. Por favor, intenta de nuevo.');
        this.isCreatingPost = false;
      }
    });
  }

  switchTab(tab: 'posts' | 'members' | 'about') {
    this.activeTab.set(tab);
  }

  toggleComments(postId: number) {
    if (this.expandedPostId === postId) {
      this.expandedPostId = null;
    } else {
      this.expandedPostId = postId;
      if (!this.postComments[postId]) {
        this.loadComments(postId);
      }
    }
  }

  loadComments(postId: number) {
    this.loadingComments[postId] = true;
    this.threadService.getCommentsByThreadId(postId).subscribe({
      next: (comments: CommentResponseDto[]) => {
        this.postComments[postId] = comments.map(c => ({
          id: c.idComment,
          author: c.user?.name || 'Usuario',
          content: c.content,
          time: this.getTimeAgo(c.creationDate),
          avatar: '/assets/img/icons/user.png'
        }));
        this.loadingComments[postId] = false;
      },
      error: (error) => {
        console.error('Error cargando comentarios:', error);
        this.postComments[postId] = [];
        this.loadingComments[postId] = false;
      }
    });
  }

  addComment(postId: number) {
    const commentText = this.newComment[postId]?.trim();
    if (!commentText || !this.currentUserId) return;

    const commentData: CommentRequestDto = {
      idUser: this.currentUserId,
      idThread: postId,
      content: commentText
    };

    this.threadService.createComment(commentData).subscribe({
      next: (comment: CommentResponseDto) => {
        console.log('Comentario creado:', comment);

        const user = this.members.find(m => m.id === this.currentUserId);
        const newComment = {
          id: comment.idComment,
          author: user?.name || 'Tu',
          content: comment.content,
          time: 'Justo ahora',
          avatar: '/assets/img/icons/user.png'
        };

        if (!this.postComments[postId]) {
          this.postComments[postId] = [];
        }
        this.postComments[postId].push(newComment);

        // Actualizar contador de comentarios en el post
        const post = this.posts.find(p => p.id === postId);
        if (post) {
          post.comments = this.postComments[postId].length;
        }

        this.newComment[postId] = '';
        this.cdr.detectChanges();
      },
      error: (error) => {
        console.error('Error creando comentario:', error);
        alert('Error al crear el comentario. Por favor, intenta de nuevo.');
      }
    });
  }

  getTimeAgo(date: Date): string {
    const now = new Date();
    const diff = now.getTime() - new Date(date).getTime();
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(minutes / 60);
    const days = Math.floor(hours / 24);

    if (days > 0) return `Hace ${days} dia${days > 1 ? 's' : ''}`;
    if (hours > 0) return `Hace ${hours} hora${hours > 1 ? 's' : ''}`;
    if (minutes > 0) return `Hace ${minutes} minuto${minutes > 1 ? 's' : ''}`;
    return 'Justo ahora';
  }
}
