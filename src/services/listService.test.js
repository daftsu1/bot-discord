import { describe, it, expect, vi, beforeEach } from 'vitest';
import { listService, getListDisplayName } from './listService.js';

const mockList = (overrides = {}) => ({
  id: 1,
  guild_id: 'g1',
  channel_id: 'c1',
  name: 'piso',
  created_by: 'user-1',
  ...overrides
});

vi.mock('../database/repositories/listRepository.js', () => ({
  listRepository: {
    create: vi.fn(),
    getById: vi.fn(),
    getByChannelAndName: vi.fn(),
    getByChannel: vi.fn(),
    addMember: vi.fn(),
    removeMember: vi.fn(),
    isMember: vi.fn(),
    canUse: vi.fn(),
    deleteList: vi.fn()
  }
}));

vi.mock('../database/repositories/userListPreferenceRepository.js', () => ({
  userListPreferenceRepository: {
    get: vi.fn(),
    set: vi.fn()
  }
}));

import { listRepository } from '../database/repositories/listRepository.js';
import { userListPreferenceRepository } from '../database/repositories/userListPreferenceRepository.js';

const GUILD = 'g1';
const CHANNEL = 'c1';
const USER = 'user-1';

describe('listService', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(listRepository.canUse).mockReturnValue(true);
  });

  describe('getListDisplayName', () => {
    it('devuelve "Mi lista" para lista personal del usuario', () => {
      const list = { name: 'personal-user-1' };
      expect(getListDisplayName(list, 'user-1')).toBe('Mi lista');
    });

    it('devuelve el nombre para lista grupal', () => {
      const list = { name: 'piso' };
      expect(getListDisplayName(list, 'user-1')).toBe('piso');
    });

    it('devuelve el nombre para lista personal de otro usuario', () => {
      const list = { name: 'personal-user-2' };
      expect(getListDisplayName(list, 'user-1')).toBe('personal-user-2');
    });
  });

  describe('createList', () => {
    it('crea lista grupal y establece preferencia', () => {
      const list = mockList();
      vi.mocked(listRepository.create).mockReturnValue(list);
      vi.mocked(listRepository.addMember).mockReturnValue(undefined);

      const result = listService.createList(GUILD, CHANNEL, 'piso', USER);

      expect(listRepository.create).toHaveBeenCalledWith(GUILD, CHANNEL, 'piso', USER);
      expect(listRepository.addMember).toHaveBeenCalledWith(list.id, USER);
      expect(userListPreferenceRepository.set).toHaveBeenCalledWith(GUILD, CHANNEL, USER, list.id);
      expect(result).toEqual(list);
    });

    it('lanza si el nombre es "mi lista"', () => {
      expect(() => listService.createList(GUILD, CHANNEL, 'mi lista', USER)).toThrow(
        'Para tu lista personal usa el comando /mi-lista.'
      );
      expect(listRepository.create).not.toHaveBeenCalled();
    });

    it('lanza si ya existe una lista con ese nombre', () => {
      vi.mocked(listRepository.create).mockReturnValue(null);

      expect(() => listService.createList(GUILD, CHANNEL, 'piso', USER)).toThrow(
        'Ya existe una lista llamada "piso" en este canal.'
      );
    });
  });

  describe('ensurePersonalList', () => {
    it('crea lista personal si no existe', () => {
      const list = mockList({ name: 'personal-user-1' });
      vi.mocked(listRepository.getByChannelAndName).mockReturnValue(null);
      vi.mocked(listRepository.create).mockReturnValue(list);
      vi.mocked(listRepository.addMember).mockReturnValue(undefined);

      const result = listService.ensurePersonalList(GUILD, CHANNEL, USER);

      expect(listRepository.getByChannelAndName).toHaveBeenCalledWith(GUILD, CHANNEL, 'personal-user-1');
      expect(listRepository.create).toHaveBeenCalledWith(GUILD, CHANNEL, 'personal-user-1', USER);
      expect(listRepository.addMember).toHaveBeenCalledWith(list.id, USER);
      expect(userListPreferenceRepository.set).toHaveBeenCalledWith(GUILD, CHANNEL, USER, list.id);
      expect(result).toEqual(list);
    });

    it('usa lista personal existente', () => {
      const list = mockList({ name: 'personal-user-1' });
      vi.mocked(listRepository.getByChannelAndName).mockReturnValue(list);

      const result = listService.ensurePersonalList(GUILD, CHANNEL, USER);

      expect(listRepository.create).not.toHaveBeenCalled();
      expect(userListPreferenceRepository.set).toHaveBeenCalledWith(GUILD, CHANNEL, USER, list.id);
      expect(result).toEqual(list);
    });
  });

  describe('joinList', () => {
    it('añade al usuario a la lista grupal', () => {
      const list = mockList();
      vi.mocked(listRepository.getByChannelAndName).mockReturnValue(list);
      vi.mocked(listRepository.addMember).mockReturnValue(true);

      const result = listService.joinList(GUILD, CHANNEL, 'piso', USER);

      expect(listRepository.addMember).toHaveBeenCalledWith(list.id, USER);
      expect(result).toEqual(list);
    });

    it('lanza si la lista no existe', () => {
      vi.mocked(listRepository.getByChannelAndName).mockReturnValue(null);

      expect(() => listService.joinList(GUILD, CHANNEL, 'inexistente', USER)).toThrow(
        'No existe la lista "inexistente" en este canal.'
      );
    });

    it('lanza si es lista personal de otro usuario', () => {
      const list = mockList({ name: 'personal-user-2' });
      vi.mocked(listRepository.getByChannelAndName).mockReturnValue(list);

      expect(() => listService.joinList(GUILD, CHANNEL, 'personal-user-2', USER)).toThrow(
        'Esa lista es personal de otro usuario. Para la tuya usa /mi-lista.'
      );
    });

    it('lanza si ya estás en la lista', () => {
      const list = mockList();
      vi.mocked(listRepository.getByChannelAndName).mockReturnValue(list);
      vi.mocked(listRepository.addMember).mockReturnValue(false);

      expect(() => listService.joinList(GUILD, CHANNEL, 'piso', USER)).toThrow(
        /Ya estás en la lista/
      );
    });
  });

  describe('leaveList', () => {
    it('sale de una lista grupal y cambia preferencia a general si era la actual', () => {
      const list = mockList();
      const general = mockList({ id: 2, name: 'general' });
      vi.mocked(listRepository.getByChannelAndName).mockReturnValue(list);
      vi.mocked(listRepository.removeMember).mockReturnValue(true);
      vi.mocked(userListPreferenceRepository.get).mockReturnValue(list.id);
      vi.mocked(listRepository.getByChannelAndName).mockImplementation((g, c, name) =>
        name === 'general' ? general : list
      );

      const result = listService.leaveList(GUILD, CHANNEL, 'piso', USER);

      expect(listRepository.removeMember).toHaveBeenCalledWith(list.id, USER);
      expect(userListPreferenceRepository.set).toHaveBeenCalledWith(GUILD, CHANNEL, USER, general.id);
      expect(result).toEqual(list);
    });

    it('lanza si la lista no existe', () => {
      vi.mocked(listRepository.getByChannelAndName).mockReturnValue(null);

      expect(() => listService.leaveList(GUILD, CHANNEL, 'inexistente', USER)).toThrow(
        'No existe la lista "inexistente" en este canal.'
      );
    });

    it('lanza si intentas salir de la lista general', () => {
      const list = mockList({ name: 'general' });
      vi.mocked(listRepository.getByChannelAndName).mockReturnValue(list);

      expect(() => listService.leaveList(GUILD, CHANNEL, 'general', USER)).toThrow(
        'No puedes salir de la lista "general".'
      );
      expect(listRepository.removeMember).not.toHaveBeenCalled();
    });

    it('lanza si intentas "salir" de tu lista personal', () => {
      const list = mockList({ name: 'personal-user-1' });
      vi.mocked(listRepository.getByChannelAndName).mockReturnValue(list);

      expect(() => listService.leaveList(GUILD, CHANNEL, 'mi lista', USER)).toThrow(
        'Tu lista personal no se abandona; usa /usar-lista para cambiar a otra lista.'
      );
    });
  });

  describe('setCurrentList (usar-lista)', () => {
    it('establece la lista actual por nombre', () => {
      const list = mockList();
      vi.mocked(listRepository.getByChannelAndName).mockReturnValue(list);

      const result = listService.setCurrentList(GUILD, CHANNEL, USER, 'piso');

      expect(listRepository.getByChannelAndName).toHaveBeenCalledWith(GUILD, CHANNEL, 'piso');
      expect(userListPreferenceRepository.set).toHaveBeenCalledWith(GUILD, CHANNEL, USER, list.id);
      expect(result).toEqual(list);
    });

    it('acepta "mi lista" y usa ensurePersonalList', () => {
      const list = mockList({ name: 'personal-user-1' });
      vi.mocked(listRepository.getByChannelAndName).mockReturnValue(null);
      vi.mocked(listRepository.create).mockReturnValue(list);
      vi.mocked(listRepository.addMember).mockReturnValue(undefined);

      const result = listService.setCurrentList(GUILD, CHANNEL, USER, 'mi lista');

      expect(listRepository.getByChannelAndName).toHaveBeenCalledWith(GUILD, CHANNEL, 'personal-user-1');
      expect(userListPreferenceRepository.set).toHaveBeenCalledWith(GUILD, CHANNEL, USER, list.id);
      expect(result).toEqual(list);
    });

    it('lanza si la lista no existe', () => {
      vi.mocked(listRepository.getByChannelAndName).mockReturnValue(null);

      expect(() => listService.setCurrentList(GUILD, CHANNEL, USER, 'inexistente')).toThrow(
        'No existe la lista "inexistente" en este canal.'
      );
    });

    it('lanza si no puedes usar la lista (no eres miembro)', () => {
      const list = mockList();
      vi.mocked(listRepository.getByChannelAndName).mockReturnValue(list);
      vi.mocked(listRepository.canUse).mockReturnValue(false);

      expect(() => listService.setCurrentList(GUILD, CHANNEL, USER, 'piso')).toThrow(
        /Únete primero con \`\/unirse\`/
      );
    });
  });

  describe('getCurrentList', () => {
    it('devuelve la lista de la preferencia del usuario si puede usarla', () => {
      const list = mockList();
      vi.mocked(userListPreferenceRepository.get).mockReturnValue(list.id);
      vi.mocked(listRepository.getById).mockReturnValue(list);

      const result = listService.getCurrentList(GUILD, CHANNEL, USER);

      expect(result).toEqual(list);
    });

    it('devuelve general si no hay preferencia', () => {
      const general = mockList({ id: 2, name: 'general' });
      vi.mocked(userListPreferenceRepository.get).mockReturnValue(null);
      vi.mocked(listRepository.getByChannelAndName).mockReturnValue(general);

      const result = listService.getCurrentList(GUILD, CHANNEL, USER);

      expect(result).toEqual(general);
    });

    it('devuelve null si no hay preferencia ni lista general', () => {
      vi.mocked(userListPreferenceRepository.get).mockReturnValue(null);
      vi.mocked(listRepository.getByChannelAndName).mockReturnValue(null);

      const result = listService.getCurrentList(GUILD, CHANNEL, USER);

      expect(result).toBeNull();
    });
  });

  describe('getListsForChannel', () => {
    it('devuelve solo listas que el usuario puede usar, con displayName e isCurrent', () => {
      const general = mockList({ id: 1, name: 'general' });
      const piso = mockList({ id: 2, name: 'piso' });
      vi.mocked(listRepository.getByChannel).mockReturnValue([general, piso]);
      vi.mocked(userListPreferenceRepository.get).mockReturnValue(piso.id);
      vi.mocked(listRepository.isMember).mockImplementation((listId, uid) => listId === 2 && uid === USER);

      const result = listService.getListsForChannel(GUILD, CHANNEL, USER);

      expect(result).toHaveLength(2);
      expect(result.map(l => ({ name: l.name, displayName: l.displayName, isCurrent: l.isCurrent }))).toEqual([
        { name: 'general', displayName: 'general', isCurrent: false },
        { name: 'piso', displayName: 'piso', isCurrent: true }
      ]);
    });
  });

  describe('deleteList', () => {
    it('elimina lista grupal si el usuario es el creador', () => {
      const list = mockList({ created_by: USER });
      vi.mocked(listRepository.getByChannelAndName).mockReturnValue(list);
      vi.mocked(listRepository.deleteList).mockReturnValue(true);

      const result = listService.deleteList(GUILD, CHANNEL, 'piso', USER);

      expect(listRepository.deleteList).toHaveBeenCalledWith(list.id);
      expect(result).toEqual(list);
    });

    it('lanza si no se puede eliminar general', () => {
      const list = mockList({ name: 'general' });
      vi.mocked(listRepository.getByChannelAndName).mockReturnValue(list);

      expect(() => listService.deleteList(GUILD, CHANNEL, 'general', USER)).toThrow(
        'No se puede eliminar la lista "general".'
      );
      expect(listRepository.deleteList).not.toHaveBeenCalled();
    });

    it('lanza si no es el creador de la lista grupal', () => {
      const list = mockList({ created_by: 'user-2' });
      vi.mocked(listRepository.getByChannelAndName).mockReturnValue(list);

      expect(() => listService.deleteList(GUILD, CHANNEL, 'piso', USER)).toThrow(
        'Solo quien creó la lista puede eliminarla.'
      );
    });
  });
});
