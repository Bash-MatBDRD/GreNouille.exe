import {
  Client,
  GatewayIntentBits,
  ActivityType,
  PresenceStatusData,
  REST,
  Routes,
  SlashCommandBuilder,
  EmbedBuilder,
  PermissionFlagsBits,
  ChannelType,
  TextChannel,
  GuildMember,
} from "discord.js";
import db from "./db.js";

let client: Client | null = null;
let gatewayReady = false;

const OWNER_ID = "785872940347949056";

// ── Slash commands definitions ─────────────────────────────────────────────────

const slashCommands = [
  // ── Info & Utilitaires ──
  new SlashCommandBuilder()
    .setName("ping")
    .setDescription("Affiche la latence du bot"),

  new SlashCommandBuilder()
    .setName("botinfo")
    .setDescription("Tout ce que tu veux savoir sur moi 🤖"),

  new SlashCommandBuilder()
    .setName("uptime")
    .setDescription("Depuis combien de temps je tourne sans m'arrêter"),

  new SlashCommandBuilder()
    .setName("help")
    .setDescription("La liste de tout ce que je sais faire"),

  new SlashCommandBuilder()
    .setName("serverinfo")
    .setDescription("Toutes les infos du serveur en un coup d'œil"),

  new SlashCommandBuilder()
    .setName("userinfo")
    .setDescription("Profil complet d'un membre")
    .addUserOption((o) =>
      o.setName("membre").setDescription("Le membre à inspecter").setRequired(false)
    ),

  new SlashCommandBuilder()
    .setName("avatar")
    .setDescription("Affiche l'avatar d'un membre en grand")
    .addUserOption((o) =>
      o.setName("membre").setDescription("Le membre cible").setRequired(false)
    ),

  new SlashCommandBuilder()
    .setName("banner")
    .setDescription("Affiche la bannière de profil d'un membre")
    .addUserOption((o) =>
      o.setName("membre").setDescription("Le membre cible").setRequired(false)
    ),

  new SlashCommandBuilder()
    .setName("rolelist")
    .setDescription("Liste tous les rôles du serveur"),

  new SlashCommandBuilder()
    .setName("channellist")
    .setDescription("Liste les salons du serveur"),

  new SlashCommandBuilder()
    .setName("membercount")
    .setDescription("Combien de personnes traînent sur ce serveur"),

  // ── Fun ──
  new SlashCommandBuilder()
    .setName("coinflip")
    .setDescription("Pile ou face, le grand classique"),

  new SlashCommandBuilder()
    .setName("roll")
    .setDescription("Lance un dé")
    .addIntegerOption((o) =>
      o.setName("faces").setDescription("Nombre de faces (défaut: 6)").setRequired(false).setMinValue(2).setMaxValue(1000)
    ),

  new SlashCommandBuilder()
    .setName("8ball")
    .setDescription("Pose une question à la boule magique 🎱")
    .addStringOption((o) =>
      o.setName("question").setDescription("Ta question").setRequired(true)
    ),

  new SlashCommandBuilder()
    .setName("choix")
    .setDescription("T'arrives pas à te décider ? Je le fais pour toi")
    .addStringOption((o) =>
      o.setName("options").setDescription("Options séparées par des virgules (ex: pizza, sushi, kebab)").setRequired(true)
    ),

  new SlashCommandBuilder()
    .setName("pp")
    .setDescription("Mesure quelque chose de façon très scientifique 📏")
    .addUserOption((o) =>
      o.setName("membre").setDescription("Le cobaye").setRequired(false)
    ),

  new SlashCommandBuilder()
    .setName("hug")
    .setDescription("Envoie un câlin 🤗")
    .addUserOption((o) =>
      o.setName("membre").setDescription("Qui tu veux câliner").setRequired(true)
    ),

  new SlashCommandBuilder()
    .setName("slap")
    .setDescription("Balance une claque 👋")
    .addUserOption((o) =>
      o.setName("membre").setDescription("La victime").setRequired(true)
    ),

  new SlashCommandBuilder()
    .setName("iq")
    .setDescription("Calcule le QI d'un membre, la science ne ment pas 🧠")
    .addUserOption((o) =>
      o.setName("membre").setDescription("Le cobaye").setRequired(false)
    ),

  new SlashCommandBuilder()
    .setName("niveau")
    .setDescription("Affiche le niveau de quelque chose pour un membre")
    .addStringOption((o) =>
      o.setName("chose").setDescription("Quoi mesurer (ex: skill, courage, swag...)").setRequired(true)
    )
    .addUserOption((o) =>
      o.setName("membre").setDescription("Le membre cible").setRequired(false)
    ),

  new SlashCommandBuilder()
    .setName("mdr")
    .setDescription("T'es vraiment drôle toi ? On va voir ça 😂")
    .addUserOption((o) =>
      o.setName("membre").setDescription("Le prétendu comique").setRequired(false)
    ),

  // ── Communication ──
  new SlashCommandBuilder()
    .setName("say")
    .setDescription("(Owner uniquement) Je répète ce que tu veux, ton message disparaît")
    .addStringOption((o) =>
      o.setName("message").setDescription("Ce que tu veux que je dise").setRequired(true)
    )
    .addChannelOption((o) =>
      o.setName("salon").setDescription("Où l'envoyer (défaut: ici)").setRequired(false)
    ),

  new SlashCommandBuilder()
    .setName("embed")
    .setDescription("Envoie un message embed stylé")
    .addStringOption((o) =>
      o.setName("titre").setDescription("Le titre de l'embed").setRequired(true)
    )
    .addStringOption((o) =>
      o.setName("description").setDescription("La description").setRequired(true)
    )
    .addStringOption((o) =>
      o.setName("couleur").setDescription("Couleur hex (ex: #7289DA)").setRequired(false)
    )
    .setDefaultMemberPermissions(PermissionFlagsBits.ManageMessages),

  new SlashCommandBuilder()
    .setName("poll")
    .setDescription("Lance un sondage avec des réactions")
    .addStringOption((o) =>
      o.setName("question").setDescription("La question du sondage").setRequired(true)
    )
    .addStringOption((o) =>
      o.setName("option1").setDescription("Option 1").setRequired(false)
    )
    .addStringOption((o) =>
      o.setName("option2").setDescription("Option 2").setRequired(false)
    )
    .addStringOption((o) =>
      o.setName("option3").setDescription("Option 3").setRequired(false)
    )
    .addStringOption((o) =>
      o.setName("option4").setDescription("Option 4").setRequired(false)
    )
    .setDefaultMemberPermissions(PermissionFlagsBits.ManageMessages),

  new SlashCommandBuilder()
    .setName("announce")
    .setDescription("Envoie une annonce officielle dans un salon")
    .addStringOption((o) =>
      o.setName("message").setDescription("Le contenu de l'annonce").setRequired(true)
    )
    .addChannelOption((o) =>
      o.setName("salon").setDescription("Le salon cible").setRequired(false)
    )
    .setDefaultMemberPermissions(PermissionFlagsBits.ManageMessages),

  // ── Modération ──
  new SlashCommandBuilder()
    .setName("ban")
    .setDescription("Bannit un membre du serveur")
    .addUserOption((o) =>
      o.setName("membre").setDescription("Le membre à bannir").setRequired(true)
    )
    .addStringOption((o) =>
      o.setName("raison").setDescription("Raison du ban").setRequired(false)
    )
    .addIntegerOption((o) =>
      o.setName("supprimer").setDescription("Supprimer X jours de messages (0-7)").setRequired(false).setMinValue(0).setMaxValue(7)
    )
    .setDefaultMemberPermissions(PermissionFlagsBits.BanMembers),

  new SlashCommandBuilder()
    .setName("kick")
    .setDescription("Expulse un membre du serveur")
    .addUserOption((o) =>
      o.setName("membre").setDescription("Le membre à expulser").setRequired(true)
    )
    .addStringOption((o) =>
      o.setName("raison").setDescription("Raison du kick").setRequired(false)
    )
    .setDefaultMemberPermissions(PermissionFlagsBits.KickMembers),

  new SlashCommandBuilder()
    .setName("mute")
    .setDescription("Met en sourdine un membre")
    .addUserOption((o) =>
      o.setName("membre").setDescription("Le membre à mute").setRequired(true)
    )
    .addIntegerOption((o) =>
      o.setName("duree").setDescription("Durée en minutes").setRequired(true).setMinValue(1).setMaxValue(40320)
    )
    .addStringOption((o) =>
      o.setName("raison").setDescription("Raison du mute").setRequired(false)
    )
    .setDefaultMemberPermissions(PermissionFlagsBits.ModerateMembers),

  new SlashCommandBuilder()
    .setName("unmute")
    .setDescription("Retire le timeout d'un membre")
    .addUserOption((o) =>
      o.setName("membre").setDescription("Le membre à unmute").setRequired(true)
    )
    .setDefaultMemberPermissions(PermissionFlagsBits.ModerateMembers),

  new SlashCommandBuilder()
    .setName("warn")
    .setDescription("Avertit un membre et le note dans la base de données")
    .addUserOption((o) =>
      o.setName("membre").setDescription("Le membre à avertir").setRequired(true)
    )
    .addStringOption((o) =>
      o.setName("raison").setDescription("Raison de l'avertissement").setRequired(true)
    )
    .setDefaultMemberPermissions(PermissionFlagsBits.ModerateMembers),

  new SlashCommandBuilder()
    .setName("warns")
    .setDescription("Affiche les avertissements d'un membre")
    .addUserOption((o) =>
      o.setName("membre").setDescription("Le membre à inspecter").setRequired(true)
    )
    .setDefaultMemberPermissions(PermissionFlagsBits.ModerateMembers),

  new SlashCommandBuilder()
    .setName("clearwarns")
    .setDescription("Efface tous les avertissements d'un membre")
    .addUserOption((o) =>
      o.setName("membre").setDescription("Le membre cible").setRequired(true)
    )
    .setDefaultMemberPermissions(PermissionFlagsBits.ModerateMembers),

  new SlashCommandBuilder()
    .setName("clear")
    .setDescription("Supprime des messages en masse")
    .addIntegerOption((o) =>
      o.setName("nombre").setDescription("Nombre de messages à supprimer (1-100)").setRequired(true).setMinValue(1).setMaxValue(100)
    )
    .addUserOption((o) =>
      o.setName("membre").setDescription("Supprimer seulement les messages de ce membre").setRequired(false)
    )
    .setDefaultMemberPermissions(PermissionFlagsBits.ManageMessages),

  new SlashCommandBuilder()
    .setName("slowmode")
    .setDescription("Active ou désactive le mode lent dans ce salon")
    .addIntegerOption((o) =>
      o.setName("secondes").setDescription("Délai en secondes (0 pour désactiver)").setRequired(true).setMinValue(0).setMaxValue(21600)
    )
    .setDefaultMemberPermissions(PermissionFlagsBits.ManageChannels),

  new SlashCommandBuilder()
    .setName("lock")
    .setDescription("Verrouille un salon — personne peut plus écrire")
    .addChannelOption((o) =>
      o.setName("salon").setDescription("Le salon à verrouiller (défaut: actuel)").setRequired(false)
    )
    .setDefaultMemberPermissions(PermissionFlagsBits.ManageChannels),

  new SlashCommandBuilder()
    .setName("unlock")
    .setDescription("Déverrouille un salon")
    .addChannelOption((o) =>
      o.setName("salon").setDescription("Le salon à déverrouiller (défaut: actuel)").setRequired(false)
    )
    .setDefaultMemberPermissions(PermissionFlagsBits.ManageChannels),

  new SlashCommandBuilder()
    .setName("role")
    .setDescription("Ajoute ou retire un rôle à un membre")
    .addUserOption((o) =>
      o.setName("membre").setDescription("Le membre cible").setRequired(true)
    )
    .addRoleOption((o) =>
      o.setName("role").setDescription("Le rôle à ajouter/retirer").setRequired(true)
    )
    .setDefaultMemberPermissions(PermissionFlagsBits.ManageRoles),

  new SlashCommandBuilder()
    .setName("nick")
    .setDescription("Change le surnom d'un membre")
    .addUserOption((o) =>
      o.setName("membre").setDescription("Le membre cible").setRequired(true)
    )
    .addStringOption((o) =>
      o.setName("surnom").setDescription("Le nouveau surnom (laisse vide pour supprimer)").setRequired(false)
    )
    .setDefaultMemberPermissions(PermissionFlagsBits.ManageNicknames),

  new SlashCommandBuilder()
    .setName("unban")
    .setDescription("Débannit quelqu'un via son ID")
    .addStringOption((o) =>
      o.setName("userid").setDescription("L'ID de l'utilisateur").setRequired(true)
    )
    .setDefaultMemberPermissions(PermissionFlagsBits.BanMembers),

  new SlashCommandBuilder()
    .setName("banlist")
    .setDescription("Voir la liste des membres bannis")
    .setDefaultMemberPermissions(PermissionFlagsBits.BanMembers),

  // ── Fun avancé ──
  new SlashCommandBuilder()
    .setName("say")
    .setDescription("Fait dire quelque chose au bot dans un salon")
    .addStringOption((o) =>
      o.setName("message").setDescription("Le message à envoyer").setRequired(true)
    )
    .addChannelOption((o) =>
      o.setName("salon").setDescription("Salon cible (défaut: actuel)").setRequired(false)
    )
    .setDefaultMemberPermissions(PermissionFlagsBits.ManageMessages),

  new SlashCommandBuilder()
    .setName("poll")
    .setDescription("Crée un sondage rapide avec réactions")
    .addStringOption((o) =>
      o.setName("question").setDescription("La question du sondage").setRequired(true)
    )
    .addStringOption((o) =>
      o.setName("choix").setDescription("Les options séparées par | (ex: Oui|Non|Peut-être)").setRequired(false)
    ),

  new SlashCommandBuilder()
    .setName("giveaway")
    .setDescription("Lance un giveaway dans ce salon")
    .addStringOption((o) =>
      o.setName("lot").setDescription("Ce qu'on gagne").setRequired(true)
    )
    .addIntegerOption((o) =>
      o.setName("minutes").setDescription("Durée en minutes").setRequired(true).setMinValue(1).setMaxValue(10080)
    )
    .addIntegerOption((o) =>
      o.setName("gagnants").setDescription("Nombre de gagnants (défaut: 1)").setRequired(false).setMinValue(1).setMaxValue(10)
    )
    .setDefaultMemberPermissions(PermissionFlagsBits.ManageEvents),

  new SlashCommandBuilder()
    .setName("emojis")
    .setDescription("Liste les emojis personnalisés du serveur"),

  new SlashCommandBuilder()
    .setName("stickers")
    .setDescription("Liste les stickers personnalisés du serveur"),

  // ── Owner only ──
  new SlashCommandBuilder()
    .setName("backup")
    .setDescription("(Owner uniquement) Sauvegarde complète du serveur de A à Z"),

  new SlashCommandBuilder()
    .setName("addrole")
    .setDescription("(Owner uniquement) Donne un rôle à un membre")
    .addUserOption((o) =>
      o.setName("membre").setDescription("Le membre cible").setRequired(true)
    )
    .addRoleOption((o) =>
      o.setName("role").setDescription("Le rôle à donner").setRequired(true)
    ),

  new SlashCommandBuilder()
    .setName("removerole")
    .setDescription("(Owner uniquement) Retire un rôle d'un membre")
    .addUserOption((o) =>
      o.setName("membre").setDescription("Le membre cible").setRequired(true)
    )
    .addRoleOption((o) =>
      o.setName("role").setDescription("Le rôle à retirer").setRequired(true)
    ),

  new SlashCommandBuilder()
    .setName("dm")
    .setDescription("(Owner uniquement) Envoie un DM à un membre")
    .addUserOption((o) =>
      o.setName("membre").setDescription("Le destinataire").setRequired(true)
    )
    .addStringOption((o) =>
      o.setName("message").setDescription("Le message à envoyer").setRequired(true)
    ),

  new SlashCommandBuilder()
    .setName("nuke")
    .setDescription("(Owner uniquement) Recrée le salon actuel (supprime tout l'historique)")
    .addChannelOption((o) =>
      o.setName("salon").setDescription("Salon à nuker (défaut: actuel)").setRequired(false)
    ),

  new SlashCommandBuilder()
    .setName("lockdown")
    .setDescription("(Owner uniquement) Verrouille ou déverrouille tous les salons texte du serveur")
    .addBooleanOption((o) =>
      o.setName("actif").setDescription("true = lock, false = unlock").setRequired(true)
    ),

  new SlashCommandBuilder()
    .setName("massrole")
    .setDescription("(Owner uniquement) Donne ou retire un rôle à tous les membres")
    .addRoleOption((o) =>
      o.setName("role").setDescription("Le rôle à appliquer").setRequired(true)
    )
    .addBooleanOption((o) =>
      o.setName("donner").setDescription("true = donner, false = retirer").setRequired(true)
    ),

  new SlashCommandBuilder()
    .setName("setslowmode")
    .setDescription("(Owner uniquement) Définit le slowmode sur n'importe quel salon")
    .addIntegerOption((o) =>
      o.setName("secondes").setDescription("Délai en secondes (0 = désactivé)").setRequired(true).setMinValue(0).setMaxValue(21600)
    )
    .addChannelOption((o) =>
      o.setName("salon").setDescription("Salon cible (défaut: actuel)").setRequired(false)
    ),

  new SlashCommandBuilder()
    .setName("ghostping")
    .setDescription("(Owner uniquement) Envoie et supprime immédiatement un ping")
    .addUserOption((o) =>
      o.setName("membre").setDescription("La victime du ghost ping").setRequired(true)
    )
    .addChannelOption((o) =>
      o.setName("salon").setDescription("Salon cible (défaut: actuel)").setRequired(false)
    ),

  new SlashCommandBuilder()
    .setName("status")
    .setDescription("(Owner uniquement) Change le statut du bot")
    .addStringOption((o) =>
      o.setName("presence").setDescription("Statut: online, idle, dnd, invisible").setRequired(true)
        .addChoices(
          { name: "🟢 En ligne", value: "online" },
          { name: "🌙 Absent", value: "idle" },
          { name: "🔴 Ne pas déranger", value: "dnd" },
          { name: "⚫ Invisible", value: "invisible" },
        )
    )
    .addStringOption((o) =>
      o.setName("activite").setDescription("Activité affichée (optionnel)").setRequired(false)
    ),
].map((cmd) => cmd.toJSON());

// ── Register slash commands ────────────────────────────────────────────────────

async function registerSlashCommands(botToken: string, clientId: string) {
  const rest = new REST({ version: "10" }).setToken(botToken);
  const guildId = process.env.DISCORD_GUILD_ID;
  try {
    if (guildId) {
      await rest.put(Routes.applicationGuildCommands(clientId, guildId), { body: slashCommands });
      console.log(`[Discord] Slash commands enregistrées pour le serveur ${guildId}`);
    } else {
      await rest.put(Routes.applicationCommands(clientId), { body: slashCommands });
      console.log("[Discord] Slash commands enregistrées globalement");
    }
  } catch (err: any) {
    console.error("[Discord] Erreur lors de l'enregistrement des slash commands:", err.message);
  }
}

// ── 8ball responses ────────────────────────────────────────────────────────────

const eightBallResponses = [
  "✅ Ouais, clairement !",
  "✅ C'est certain, fonce.",
  "✅ Aucun doute là-dessus.",
  "✅ Carrément oui.",
  "✅ T'as ma parole.",
  "🤷 C'est pas très clair pour l'instant...",
  "🤷 Reviens me voir plus tard.",
  "🤷 Mieux vaut que je la ferme sur ce coup-là.",
  "🤷 Impossible de te répondre maintenant.",
  "❌ Compte pas là-dessus.",
  "❌ Nope.",
  "❌ Mes sources disent non.",
  "❌ Ça sent pas bon pour toi.",
  "❌ Très très douteux.",
];

// ── Color parser ───────────────────────────────────────────────────────────────

function parseColor(hex: string | null): number {
  if (!hex) return 0x5865f2;
  return parseInt(hex.replace("#", ""), 16) || 0x5865f2;
}

// ── Handle slash commands ──────────────────────────────────────────────────────

async function handleInteraction(interaction: any) {
  if (!interaction.isChatInputCommand()) return;

  const { commandName } = interaction;
  const guild = interaction.guild;
  const member = interaction.member as GuildMember;
  const isOwner = interaction.user.id === OWNER_ID;

  try {

    // ── ping ──
    if (commandName === "ping") {
      const latency = client!.ws.ping;
      await interaction.reply({
        embeds: [
          new EmbedBuilder()
            .setColor(0x00d166)
            .setTitle("🏓 Pong !")
            .addFields(
              { name: "Latence Bot", value: `\`${latency}ms\``, inline: true },
              { name: "Latence API", value: `\`${Date.now() - interaction.createdTimestamp}ms\``, inline: true }
            )
            .setFooter({ text: "Oui je suis là, t'inquiète." }),
        ],
      });
    }

    // ── botinfo ──
    else if (commandName === "botinfo") {
      const uptimeSec = Math.floor((client!.uptime ?? 0) / 1000);
      const h = Math.floor(uptimeSec / 3600);
      const m = Math.floor((uptimeSec % 3600) / 60);
      const s = uptimeSec % 60;
      await interaction.reply({
        embeds: [
          new EmbedBuilder()
            .setColor(0x5865f2)
            .setTitle("🤖 Mes infos")
            .setThumbnail(client!.user!.displayAvatarURL())
            .addFields(
              { name: "Nom", value: client!.user!.tag, inline: true },
              { name: "ID", value: client!.user!.id, inline: true },
              { name: "Serveurs", value: `${client!.guilds.cache.size}`, inline: true },
              { name: "Latence", value: `${client!.ws.ping}ms`, inline: true },
              { name: "Uptime", value: `${h}h ${m}m ${s}s`, inline: true },
              { name: "Version discord.js", value: "14.x", inline: true }
            )
            .setFooter({ text: "Nexus Panel — par GreNouille.exe" })
            .setTimestamp(),
        ],
      });
    }

    // ── uptime ──
    else if (commandName === "uptime") {
      const uptimeSec = Math.floor((client!.uptime ?? 0) / 1000);
      const days = Math.floor(uptimeSec / 86400);
      const h = Math.floor((uptimeSec % 86400) / 3600);
      const m = Math.floor((uptimeSec % 3600) / 60);
      const s = uptimeSec % 60;
      await interaction.reply({
        embeds: [
          new EmbedBuilder()
            .setColor(0x00b4d8)
            .setTitle("⏱️ Uptime")
            .setDescription(`Je tourne sans interruption depuis **${days}j ${h}h ${m}m ${s}s** — pas mal non ?`),
        ],
      });
    }

    // ── help ──
    else if (commandName === "help") {
      await interaction.reply({
        embeds: [
          new EmbedBuilder()
            .setColor(0x5865f2)
            .setTitle("📖 Ce que je sais faire")
            .addFields(
              { name: "📊 Informations", value: "`/ping` `/botinfo` `/uptime` `/serverinfo` `/userinfo` `/avatar` `/banner` `/rolelist` `/channellist` `/membercount`" },
              { name: "🎉 Fun", value: "`/coinflip` `/roll` `/8ball` `/choix` `/pp` `/hug` `/slap` `/iq` `/niveau` `/mdr`" },
              { name: "📢 Communication", value: "`/embed` `/poll` `/announce`" },
              { name: "🔨 Modération", value: "`/ban` `/kick` `/mute` `/unmute` `/warn` `/warns` `/clearwarns` `/clear` `/slowmode` `/lock` `/unlock` `/role` `/nick` `/unban` `/banlist`" },
              { name: "👑 Owner uniquement", value: "`/say` `/backup`" }
            )
            .setFooter({ text: "Tu peux aussi me mentionner pour un raccourci !" })
            .setTimestamp(),
        ],
      });
    }

    // ── serverinfo ──
    else if (commandName === "serverinfo") {
      if (!guild) return interaction.reply({ content: "Cette commande marche seulement dans un serveur.", ephemeral: true });
      const owner = await guild.fetchOwner();
      const created = Math.floor(guild.createdTimestamp / 1000);
      await interaction.reply({
        embeds: [
          new EmbedBuilder()
            .setColor(0xf4a261)
            .setTitle(`🏠 ${guild.name}`)
            .setThumbnail(guild.iconURL({ size: 256 }) ?? null)
            .addFields(
              { name: "ID", value: guild.id, inline: true },
              { name: "Proprio", value: owner.user.tag, inline: true },
              { name: "Membres", value: `${guild.memberCount}`, inline: true },
              { name: "Salons", value: `${guild.channels.cache.size}`, inline: true },
              { name: "Rôles", value: `${guild.roles.cache.size}`, inline: true },
              { name: "Boosts", value: `${guild.premiumSubscriptionCount ?? 0} (Niv. ${guild.premiumTier})`, inline: true },
              { name: "Créé le", value: `<t:${created}:D> (<t:${created}:R>)`, inline: false },
            )
            .setTimestamp(),
        ],
      });
    }

    // ── userinfo ──
    else if (commandName === "userinfo") {
      const target = (interaction.options.getMember("membre") as GuildMember | null) ?? member;
      const user = target.user;
      const joinedAt = target.joinedTimestamp ? Math.floor(target.joinedTimestamp / 1000) : 0;
      const createdAt = Math.floor(user.createdTimestamp / 1000);
      const roles = target.roles.cache.filter((r: any) => r.id !== guild?.id).map((r: any) => `<@&${r.id}>`).join(", ") || "Aucun";
      await interaction.reply({
        embeds: [
          new EmbedBuilder()
            .setColor(0x90e0ef)
            .setTitle(`👤 ${user.tag}`)
            .setThumbnail(user.displayAvatarURL({ size: 256 }))
            .addFields(
              { name: "ID", value: user.id, inline: true },
              { name: "Pseudo serveur", value: target.displayName, inline: true },
              { name: "Bot ?", value: user.bot ? "Oui" : "Non", inline: true },
              { name: "Compte créé", value: `<t:${createdAt}:D> (<t:${createdAt}:R>)`, inline: false },
              { name: "A rejoint", value: joinedAt ? `<t:${joinedAt}:D> (<t:${joinedAt}:R>)` : "Inconnu", inline: false },
              { name: `Rôles (${target.roles.cache.size - 1})`, value: roles.length > 1024 ? roles.slice(0, 1020) + "..." : roles, inline: false },
            )
            .setTimestamp(),
        ],
      });
    }

    // ── avatar ──
    else if (commandName === "avatar") {
      const target = interaction.options.getUser("membre") ?? interaction.user;
      const avatarUrl = target.displayAvatarURL({ size: 512 });
      await interaction.reply({
        embeds: [
          new EmbedBuilder()
            .setColor(0x5865f2)
            .setTitle(`🖼️ Avatar de ${target.username}`)
            .setImage(avatarUrl)
            .addFields({ name: "Lien direct", value: `[Cliquez ici](${avatarUrl})` }),
        ],
      });
    }

    // ── banner ──
    else if (commandName === "banner") {
      const targetUser = interaction.options.getUser("membre") ?? interaction.user;
      const fetched = await targetUser.fetch();
      const bannerUrl = (fetched as any).bannerURL?.({ size: 512 });
      if (!bannerUrl) {
        return interaction.reply({ content: `**${targetUser.username}** a pas de bannière, dommage.`, ephemeral: true });
      }
      await interaction.reply({
        embeds: [
          new EmbedBuilder()
            .setColor(0x5865f2)
            .setTitle(`🖼️ Bannière de ${targetUser.username}`)
            .setImage(bannerUrl),
        ],
      });
    }

    // ── rolelist ──
    else if (commandName === "rolelist") {
      if (!guild) return interaction.reply({ content: "Serveur uniquement.", ephemeral: true });
      const roles = guild.roles.cache
        .filter((r: any) => r.id !== guild.id)
        .sort((a: any, b: any) => b.position - a.position)
        .map((r: any) => `<@&${r.id}>`)
        .slice(0, 30)
        .join(", ");
      await interaction.reply({
        embeds: [
          new EmbedBuilder()
            .setColor(0xe76f51)
            .setTitle(`🎭 Rôles du serveur (${guild.roles.cache.size - 1})`)
            .setDescription(roles || "Aucun rôle"),
        ],
      });
    }

    // ── channellist ──
    else if (commandName === "channellist") {
      if (!guild) return interaction.reply({ content: "Serveur uniquement.", ephemeral: true });
      const text = guild.channels.cache.filter((c: any) => c.type === ChannelType.GuildText).map((c: any) => `<#${c.id}>`).slice(0, 20).join(", ");
      const voice = guild.channels.cache.filter((c: any) => c.type === ChannelType.GuildVoice).map((c: any) => `🔊 ${c.name}`).slice(0, 10).join(", ");
      await interaction.reply({
        embeds: [
          new EmbedBuilder()
            .setColor(0x52b788)
            .setTitle(`📋 Salons du serveur`)
            .addFields(
              { name: `💬 Texte (${guild.channels.cache.filter((c: any) => c.type === ChannelType.GuildText).size})`, value: text || "Aucun" },
              { name: `🔊 Vocal (${guild.channels.cache.filter((c: any) => c.type === ChannelType.GuildVoice).size})`, value: voice || "Aucun" },
            ),
        ],
      });
    }

    // ── membercount ──
    else if (commandName === "membercount") {
      if (!guild) return interaction.reply({ content: "Serveur uniquement.", ephemeral: true });
      const bots = guild.members.cache.filter((m: any) => m.user.bot).size;
      const humans = guild.memberCount - bots;
      await interaction.reply({
        embeds: [
          new EmbedBuilder()
            .setColor(0x80b918)
            .setTitle("👥 Y'a du monde ici !")
            .addFields(
              { name: "Total", value: `${guild.memberCount}`, inline: true },
              { name: "Humains", value: `${humans}`, inline: true },
              { name: "Bots", value: `${bots}`, inline: true },
            ),
        ],
      });
    }

    // ── coinflip ──
    else if (commandName === "coinflip") {
      const result = Math.random() < 0.5 ? "🪙 Pile !" : "🟡 Face !";
      await interaction.reply({ content: `**${interaction.user.username}** lance la pièce... **${result}**` });
    }

    // ── roll ──
    else if (commandName === "roll") {
      const faces = interaction.options.getInteger("faces") ?? 6;
      const result = Math.floor(Math.random() * faces) + 1;
      await interaction.reply({ content: `🎲 **${interaction.user.username}** lance un dé à **${faces}** faces et tombe sur... **${result}** !` });
    }

    // ── 8ball ──
    else if (commandName === "8ball") {
      const question = interaction.options.getString("question", true);
      const response = eightBallResponses[Math.floor(Math.random() * eightBallResponses.length)];
      await interaction.reply({
        embeds: [
          new EmbedBuilder()
            .setColor(0x2b2d31)
            .setTitle("🎱 La Boule Magique a parlé")
            .addFields(
              { name: "❓ Ta question", value: question },
              { name: "🔮 Ma réponse", value: response }
            )
            .setFooter({ text: "Je suis pas responsable des conséquences." }),
        ],
      });
    }

    // ── choix ──
    else if (commandName === "choix") {
      const rawOptions = interaction.options.getString("options", true);
      const choices = rawOptions.split(",").map((s: string) => s.trim()).filter(Boolean);
      if (choices.length < 2) return interaction.reply({ content: "Donne-moi au moins 2 options séparées par des virgules stp !", ephemeral: true });
      const chosen = choices[Math.floor(Math.random() * choices.length)];
      await interaction.reply({
        embeds: [
          new EmbedBuilder()
            .setColor(0xffd60a)
            .setTitle("🎯 Mon choix est fait !")
            .setDescription(`Je vote **${chosen}** !`)
            .setFooter({ text: `Options proposées : ${choices.join(" · ")}` }),
        ],
      });
    }

    // ── pp ──
    else if (commandName === "pp") {
      const target = interaction.options.getUser("membre") ?? interaction.user;
      const size = Math.floor(Math.random() * 30);
      const bar = "8" + "=".repeat(size) + "D";
      await interaction.reply({ content: `📏 **${target.username}** : \`${bar}\` *(${size} cm, c'est la science qui parle)*` });
    }

    // ── hug ──
    else if (commandName === "hug") {
      const target = interaction.options.getUser("membre", true);
      if (target.id === client!.user!.id) {
        return interaction.reply({ content: `Aww merci **${interaction.user.username}** ! 🥺 Un câlin pour moi, ça fait plaisir !` });
      }
      await interaction.reply({ content: `🤗 **${interaction.user.username}** fait un gros câlin à **${target.username}** !` });
    }

    // ── slap ──
    else if (commandName === "slap") {
      const target = interaction.options.getUser("membre", true);
      if (target.id === client!.user!.id) {
        return interaction.reply({ content: `Hé ! Tu me touches pas toi ! 😤` });
      }
      await interaction.reply({ content: `👋 **${interaction.user.username}** balance une claque à **${target.username}** ! Aïe !` });
    }

    // ── iq ──
    else if (commandName === "iq") {
      const target = interaction.options.getUser("membre") ?? interaction.user;
      const iq = Math.floor(Math.random() * 200) + 50;
      const comment = iq < 80 ? "🥴 Euh... intéressant." : iq < 100 ? "😐 Dans la moyenne, c'est déjà ça." : iq < 140 ? "😎 Pas mal du tout !" : "🧠 Un génie parmi nous.";
      await interaction.reply({ content: `🧠 **${target.username}** a un QI de **${iq}** — ${comment}` });
    }

    // ── niveau ──
    else if (commandName === "niveau") {
      const target = interaction.options.getUser("membre") ?? interaction.user;
      const chose = interaction.options.getString("chose", true);
      const pct = Math.floor(Math.random() * 101);
      const bar = "█".repeat(Math.floor(pct / 10)) + "░".repeat(10 - Math.floor(pct / 10));
      await interaction.reply({ content: `📊 Niveau **${chose}** de **${target.username}** :\n\`${bar}\` **${pct}%**` });
    }

    // ── mdr ──
    else if (commandName === "mdr") {
      const target = interaction.options.getUser("membre") ?? interaction.user;
      const pct = Math.floor(Math.random() * 101);
      const comment = pct < 20 ? "💀 Pitié non." : pct < 50 ? "😐 Bof." : pct < 80 ? "😄 Pas mal !" : "😂 MDR c'est chaud !";
      await interaction.reply({ content: `😂 **${target.username}** est drôle à **${pct}%** — ${comment}` });
    }

    // ── say (OWNER ONLY) ──
    else if (commandName === "say") {
      if (!isOwner) {
        return interaction.reply({ content: "Cette commande c'est pas pour toi.", ephemeral: true });
      }
      const message = interaction.options.getString("message", true);
      const channel = (interaction.options.getChannel("salon") ?? interaction.channel) as TextChannel;
      await interaction.deferReply({ ephemeral: true });
      await channel.send(message);
      await interaction.deleteReply();
    }

    // ── embed ──
    else if (commandName === "embed") {
      const titre = interaction.options.getString("titre", true);
      const description = interaction.options.getString("description", true);
      const couleur = interaction.options.getString("couleur");
      const channel = interaction.channel as TextChannel;
      await channel.send({
        embeds: [
          new EmbedBuilder()
            .setColor(parseColor(couleur) as any)
            .setTitle(titre)
            .setDescription(description)
            .setTimestamp(),
        ],
      });
      await interaction.reply({ content: "✅ Envoyé !", ephemeral: true });
    }

    // ── poll ──
    else if (commandName === "poll") {
      const question = interaction.options.getString("question", true);
      const opts = [
        interaction.options.getString("option1"),
        interaction.options.getString("option2"),
        interaction.options.getString("option3"),
        interaction.options.getString("option4"),
      ].filter(Boolean) as string[];

      const emojis = ["1️⃣", "2️⃣", "3️⃣", "4️⃣"];
      const description = opts.length === 0
        ? "Réagissez avec 👍 ou 👎"
        : opts.map((o, i) => `${emojis[i]} ${o}`).join("\n");

      const pollMsg = await (interaction.channel as TextChannel).send({
        embeds: [
          new EmbedBuilder()
            .setColor(0xffd60a)
            .setTitle(`📊 ${question}`)
            .setDescription(description)
            .setFooter({ text: `Sondage lancé par ${interaction.user.tag}` })
            .setTimestamp(),
        ],
      });

      if (opts.length === 0) {
        await pollMsg.react("👍");
        await pollMsg.react("👎");
      } else {
        for (let i = 0; i < opts.length; i++) await pollMsg.react(emojis[i]);
      }

      await interaction.reply({ content: "✅ Sondage lancé !", ephemeral: true });
    }

    // ── announce ──
    else if (commandName === "announce") {
      const message = interaction.options.getString("message", true);
      const channel = (interaction.options.getChannel("salon") ?? interaction.channel) as TextChannel;
      await channel.send({
        embeds: [
          new EmbedBuilder()
            .setColor(0xff6b6b)
            .setTitle("📢 Annonce")
            .setDescription(message)
            .setFooter({ text: `Annoncé par ${interaction.user.tag}` })
            .setTimestamp(),
        ],
      });
      await interaction.reply({ content: "✅ Annonce envoyée !", ephemeral: true });
    }

    // ── ban ──
    else if (commandName === "ban") {
      if (!guild) return interaction.reply({ content: "Serveur uniquement.", ephemeral: true });
      const target = interaction.options.getMember("membre") as GuildMember | null;
      if (!target) return interaction.reply({ content: "Ce membre est introuvable.", ephemeral: true });
      const raison = interaction.options.getString("raison") ?? "Aucune raison fournie";
      const supprimer = interaction.options.getInteger("supprimer") ?? 0;
      await guild.members.ban(target, { reason: raison, deleteMessageSeconds: supprimer * 86400 });
      await interaction.reply({
        embeds: [
          new EmbedBuilder()
            .setColor(0xff0000)
            .setTitle("🔨 Banni")
            .addFields(
              { name: "Membre", value: target.user.tag, inline: true },
              { name: "Raison", value: raison, inline: true },
              { name: "Sanctionné par", value: interaction.user.tag, inline: true }
            ),
        ],
      });
    }

    // ── kick ──
    else if (commandName === "kick") {
      if (!guild) return interaction.reply({ content: "Serveur uniquement.", ephemeral: true });
      const target = interaction.options.getMember("membre") as GuildMember | null;
      if (!target) return interaction.reply({ content: "Ce membre est introuvable.", ephemeral: true });
      const raison = interaction.options.getString("raison") ?? "Aucune raison fournie";
      await target.kick(raison);
      await interaction.reply({
        embeds: [
          new EmbedBuilder()
            .setColor(0xff8800)
            .setTitle("👢 Expulsé")
            .addFields(
              { name: "Membre", value: target.user.tag, inline: true },
              { name: "Raison", value: raison, inline: true },
              { name: "Sanctionné par", value: interaction.user.tag, inline: true }
            ),
        ],
      });
    }

    // ── mute ──
    else if (commandName === "mute") {
      if (!guild) return interaction.reply({ content: "Serveur uniquement.", ephemeral: true });
      const target = interaction.options.getMember("membre") as GuildMember | null;
      if (!target) return interaction.reply({ content: "Ce membre est introuvable.", ephemeral: true });
      const duree = interaction.options.getInteger("duree", true);
      const raison = interaction.options.getString("raison") ?? "Aucune raison fournie";
      const until = new Date(Date.now() + duree * 60 * 1000);
      await target.timeout(duree * 60 * 1000, raison);
      await interaction.reply({
        embeds: [
          new EmbedBuilder()
            .setColor(0xffa500)
            .setTitle("🔇 Mute appliqué")
            .addFields(
              { name: "Membre", value: target.user.tag, inline: true },
              { name: "Durée", value: `${duree} min`, inline: true },
              { name: "Fin", value: `<t:${Math.floor(until.getTime() / 1000)}:R>`, inline: true },
              { name: "Raison", value: raison, inline: false },
            ),
        ],
      });
    }

    // ── unmute ──
    else if (commandName === "unmute") {
      if (!guild) return interaction.reply({ content: "Serveur uniquement.", ephemeral: true });
      const target = interaction.options.getMember("membre") as GuildMember | null;
      if (!target) return interaction.reply({ content: "Ce membre est introuvable.", ephemeral: true });
      await target.timeout(null);
      await interaction.reply({
        embeds: [
          new EmbedBuilder()
            .setColor(0x00d166)
            .setTitle("🔊 Unmute")
            .setDescription(`**${target.user.tag}** peut de nouveau parler.`),
        ],
      });
    }

    // ── warn ──
    else if (commandName === "warn") {
      if (!guild) return interaction.reply({ content: "Serveur uniquement.", ephemeral: true });
      const target = interaction.options.getMember("membre") as GuildMember | null;
      if (!target) return interaction.reply({ content: "Ce membre est introuvable.", ephemeral: true });
      const raison = interaction.options.getString("raison", true);
      db.prepare(
        "INSERT INTO discord_warnings (guildId, userId, username, reason, warnedBy) VALUES (?, ?, ?, ?, ?)"
      ).run(guild.id, target.user.id, target.user.username, raison, interaction.user.username);
      const count = (db.prepare("SELECT COUNT(*) as c FROM discord_warnings WHERE guildId = ? AND userId = ?").get(guild.id, target.user.id) as any).c;
      await interaction.reply({
        embeds: [
          new EmbedBuilder()
            .setColor(0xffcc00)
            .setTitle("⚠️ Avertissement")
            .addFields(
              { name: "Membre", value: target.user.tag, inline: true },
              { name: "Total warns", value: `${count}`, inline: true },
              { name: "Raison", value: raison, inline: false },
            ),
        ],
      });
    }

    // ── warns ──
    else if (commandName === "warns") {
      if (!guild) return interaction.reply({ content: "Serveur uniquement.", ephemeral: true });
      const target = interaction.options.getMember("membre") as GuildMember | null;
      if (!target) return interaction.reply({ content: "Ce membre est introuvable.", ephemeral: true });
      const rows = db.prepare("SELECT * FROM discord_warnings WHERE guildId = ? AND userId = ? ORDER BY createdAt DESC").all(guild.id, target.user.id) as any[];
      if (rows.length === 0) {
        return interaction.reply({ content: `✅ Aucun warn pour **${target.user.tag}**, il est clean.` });
      }
      const list = rows.map((w, i) => `**${i + 1}.** ${w.reason} — *par ${w.warnedBy ?? "?"}* (<t:${Math.floor(new Date(w.createdAt).getTime() / 1000)}:d>)`).join("\n");
      await interaction.reply({
        embeds: [
          new EmbedBuilder()
            .setColor(0xffcc00)
            .setTitle(`⚠️ Warns de ${target.user.tag} (${rows.length})`)
            .setDescription(list.slice(0, 4096)),
        ],
      });
    }

    // ── clearwarns ──
    else if (commandName === "clearwarns") {
      if (!guild) return interaction.reply({ content: "Serveur uniquement.", ephemeral: true });
      const target = interaction.options.getMember("membre") as GuildMember | null;
      if (!target) return interaction.reply({ content: "Ce membre est introuvable.", ephemeral: true });
      db.prepare("DELETE FROM discord_warnings WHERE guildId = ? AND userId = ?").run(guild.id, target.user.id);
      await interaction.reply({
        embeds: [
          new EmbedBuilder()
            .setColor(0x00d166)
            .setTitle("🧹 Warns effacés")
            .setDescription(`Les avertissements de **${target.user.tag}** sont partis à la poubelle.`),
        ],
      });
    }

    // ── clear ──
    else if (commandName === "clear") {
      if (!guild) return interaction.reply({ content: "Serveur uniquement.", ephemeral: true });
      const nombre = interaction.options.getInteger("nombre", true);
      const targetUser = interaction.options.getUser("membre");
      const channel = interaction.channel as TextChannel;
      await interaction.deferReply({ ephemeral: true });
      let messages = await channel.messages.fetch({ limit: Math.min(nombre + 1, 100) });
      if (targetUser) messages = messages.filter((m: any) => m.author.id === targetUser.id);
      const toDelete = messages.filter((m: any) => Date.now() - m.createdTimestamp < 14 * 24 * 60 * 60 * 1000);
      const deleted = await channel.bulkDelete(toDelete, true);
      await interaction.editReply({ content: `✅ **${deleted.size}** message(s) supprimé(s), propre !` });
    }

    // ── slowmode ──
    else if (commandName === "slowmode") {
      if (!guild) return interaction.reply({ content: "Serveur uniquement.", ephemeral: true });
      const secondes = interaction.options.getInteger("secondes", true);
      const channel = interaction.channel as TextChannel;
      await channel.setRateLimitPerUser(secondes);
      const msg = secondes === 0 ? "Mode lent désactivé, c'est reparti !" : `Mode lent défini à **${secondes} secondes**.`;
      await interaction.reply({ content: `⏱️ ${msg}` });
    }

    // ── lock ──
    else if (commandName === "lock") {
      if (!guild) return interaction.reply({ content: "Serveur uniquement.", ephemeral: true });
      const channel = (interaction.options.getChannel("salon") ?? interaction.channel) as TextChannel;
      await channel.permissionOverwrites.edit(guild.roles.everyone, { SendMessages: false });
      await interaction.reply({ content: `🔒 **${channel.name}** est verrouillé. Plus personne écrit ici.` });
    }

    // ── unlock ──
    else if (commandName === "unlock") {
      if (!guild) return interaction.reply({ content: "Serveur uniquement.", ephemeral: true });
      const channel = (interaction.options.getChannel("salon") ?? interaction.channel) as TextChannel;
      await channel.permissionOverwrites.edit(guild.roles.everyone, { SendMessages: null });
      await interaction.reply({ content: `🔓 **${channel.name}** est déverrouillé. On peut parler de nouveau !` });
    }

    // ── role ──
    else if (commandName === "role") {
      if (!guild) return interaction.reply({ content: "Serveur uniquement.", ephemeral: true });
      const target = interaction.options.getMember("membre") as GuildMember | null;
      const role = interaction.options.getRole("role");
      if (!target || !role) return interaction.reply({ content: "Membre ou rôle introuvable.", ephemeral: true });
      if (target.roles.cache.has(role.id)) {
        await target.roles.remove(role.id);
        await interaction.reply({ content: `✅ Rôle **${role.name}** retiré à **${target.user.tag}**.` });
      } else {
        await target.roles.add(role.id);
        await interaction.reply({ content: `✅ Rôle **${role.name}** ajouté à **${target.user.tag}**.` });
      }
    }

    // ── nick ──
    else if (commandName === "nick") {
      if (!guild) return interaction.reply({ content: "Serveur uniquement.", ephemeral: true });
      const target = interaction.options.getMember("membre") as GuildMember | null;
      if (!target) return interaction.reply({ content: "Ce membre est introuvable.", ephemeral: true });
      const surnom = interaction.options.getString("surnom") ?? null;
      await target.setNickname(surnom);
      const msg = surnom ? `Surnom de **${target.user.tag}** changé en **${surnom}**.` : `Surnom de **${target.user.tag}** supprimé.`;
      await interaction.reply({ content: `✅ ${msg}` });
    }

    // ── unban ──
    else if (commandName === "unban") {
      if (!guild) return interaction.reply({ content: "Serveur uniquement.", ephemeral: true });
      const userId = interaction.options.getString("userid", true);
      await guild.members.unban(userId);
      await interaction.reply({ content: `✅ L'utilisateur \`${userId}\` est débanni, il peut revenir.` });
    }

    // ── banlist ──
    else if (commandName === "banlist") {
      if (!guild) return interaction.reply({ content: "Serveur uniquement.", ephemeral: true });
      const bans = await guild.bans.fetch();
      if (bans.size === 0) {
        return interaction.reply({ content: "✅ Personne de banni ici, tout le monde est sage.", ephemeral: true });
      }
      const list = bans.map((b: any) => `**${b.user.tag}** — ${b.reason ?? "Aucune raison"}`).slice(0, 20).join("\n");
      await interaction.reply({
        embeds: [
          new EmbedBuilder()
            .setColor(0xff0000)
            .setTitle(`🔨 Membres bannis (${bans.size})`)
            .setDescription(list),
        ],
        ephemeral: true,
      });
    }

    // ── backup (OWNER ONLY) ──
    else if (commandName === "backup") {
      if (!isOwner) {
        return interaction.reply({ content: "Cette commande est réservée au propriétaire du bot.", ephemeral: true });
      }
      if (!guild) return interaction.reply({ content: "Serveur uniquement.", ephemeral: true });

      await interaction.deferReply({ ephemeral: true });

      const [guildData, channelsData, rolesData, bansData, emojisData] = await Promise.all([
        guild.fetch(),
        guild.channels.fetch(),
        guild.roles.fetch(),
        guild.bans.fetch(),
        guild.emojis.fetch(),
      ]);

      const backup = {
        exportedAt: new Date().toISOString(),
        exportedBy: interaction.user.tag,
        guild: {
          id: guildData.id,
          name: guildData.name,
          description: guildData.description,
          icon: guildData.iconURL({ size: 512 }),
          banner: guildData.bannerURL?.({ size: 512 }),
          memberCount: guildData.memberCount,
          verificationLevel: guildData.verificationLevel,
          defaultMessageNotifications: guildData.defaultMessageNotifications,
          explicitContentFilter: guildData.explicitContentFilter,
          premiumTier: guildData.premiumTier,
          premiumSubscriptionCount: guildData.premiumSubscriptionCount,
          preferredLocale: guildData.preferredLocale,
          afkTimeout: guildData.afkTimeout,
          systemChannelId: guildData.systemChannelId,
        },
        roles: rolesData
          .filter((r: any) => r.id !== guild.id)
          .sort((a: any, b: any) => b.position - a.position)
          .map((r: any) => ({
            id: r.id,
            name: r.name,
            color: r.color,
            hoist: r.hoist,
            mentionable: r.mentionable,
            permissions: r.permissions.toArray(),
            position: r.position,
          })),
        channels: channelsData
          .filter((c: any) => c !== null)
          .map((c: any) => ({
            id: c.id,
            name: c.name,
            type: c.type,
            position: c.position,
            parentId: c.parentId,
            topic: (c as any).topic ?? null,
            nsfw: (c as any).nsfw ?? false,
            rateLimitPerUser: (c as any).rateLimitPerUser ?? 0,
            userLimit: (c as any).userLimit ?? 0,
            bitrate: (c as any).bitrate ?? null,
            permissionOverwrites: c.permissionOverwrites?.cache?.map((perm: any) => ({
              id: perm.id,
              type: perm.type,
              allow: perm.allow.toArray(),
              deny: perm.deny.toArray(),
            })) ?? [],
          })),
        bans: bansData.map((b: any) => ({
          userId: b.user.id,
          userTag: b.user.tag,
          reason: b.reason,
        })),
        emojis: emojisData.map((e: any) => ({
          id: e.id,
          name: e.name,
          animated: e.animated,
          url: e.url,
        })),
      };

      const jsonBuffer = Buffer.from(JSON.stringify(backup, null, 2), "utf-8");

      try {
        await interaction.user.send({
          content: `📦 Voilà le backup complet de **${guild.name}** — garde ça au chaud !`,
          files: [{ attachment: jsonBuffer, name: `backup-${guild.name}-${Date.now()}.json` }],
        });
        await interaction.editReply({ content: `✅ Backup envoyé dans tes DMs ! Vérifie tes messages privés.` });
      } catch {
        await interaction.editReply({ content: `❌ J'arrive pas à t'envoyer le backup en DM. Ouvre tes DMs sur ce serveur et réessaie.` });
      }
    }

    // ── say ──
    else if (commandName === "say") {
      const msg = interaction.options.getString("message", true);
      const targetCh = (interaction.options.getChannel("salon") ?? interaction.channel) as TextChannel;
      await (targetCh as TextChannel).send(msg);
      await interaction.reply({ content: `✅ Message envoyé dans <#${targetCh.id}>.`, ephemeral: true });
    }

    // ── poll ──
    else if (commandName === "poll") {
      const question = interaction.options.getString("question", true);
      const choixStr = interaction.options.getString("choix");
      const options = choixStr ? choixStr.split("|").map((c) => c.trim()).filter(Boolean) : null;
      const EMOJIS = ["1️⃣","2️⃣","3️⃣","4️⃣","5️⃣","6️⃣","7️⃣","8️⃣","9️⃣","🔟"];
      const embed = new EmbedBuilder()
        .setColor(parseColor(null))
        .setTitle(`📊 ${question}`)
        .setFooter({ text: `Sondage lancé par ${interaction.user.username}` })
        .setTimestamp();
      if (options && options.length >= 2) {
        embed.setDescription(options.map((opt, i) => `${EMOJIS[i]} ${opt}`).join("\n\n"));
      }
      await interaction.reply({ embeds: [embed] });
      const msg = await interaction.fetchReply();
      if (options && options.length >= 2) {
        for (let i = 0; i < Math.min(options.length, 10); i++) {
          await msg.react(EMOJIS[i]).catch(() => {});
        }
      } else {
        await msg.react("👍").catch(() => {});
        await msg.react("👎").catch(() => {});
      }
    }

    // ── giveaway ──
    else if (commandName === "giveaway") {
      const lot = interaction.options.getString("lot", true);
      const minutes = interaction.options.getInteger("minutes", true);
      const gagnants = interaction.options.getInteger("gagnants") ?? 1;
      const endTime = new Date(Date.now() + minutes * 60_000);
      const embed = new EmbedBuilder()
        .setColor(0xffd700)
        .setTitle(`🎉 GIVEAWAY — ${lot}`)
        .setDescription(`Réagis avec 🎉 pour participer !\n\n**Fin :** <t:${Math.floor(endTime.getTime() / 1000)}:R>\n**Gagnants :** ${gagnants}\n**Organisateur :** ${interaction.user}`)
        .setFooter({ text: `Se termine dans ${minutes < 60 ? `${minutes}min` : `${Math.round(minutes / 60)}h`}` })
        .setTimestamp(endTime);
      await interaction.reply({ embeds: [embed] });
      const msg = await interaction.fetchReply();
      await msg.react("🎉").catch(() => {});
    }

    // ── emojis ──
    else if (commandName === "emojis") {
      if (!guild) return interaction.reply({ content: "Serveur uniquement.", ephemeral: true });
      const emojis = guild.emojis.cache;
      if (emojis.size === 0) return interaction.reply({ content: "Ce serveur n'a aucun emoji personnalisé.", ephemeral: true });
      const list = emojis.map((e) => `${e} \`:${e.name}:\``).slice(0, 40).join(" ") + (emojis.size > 40 ? `\n*(+${emojis.size - 40} autres...)*` : "");
      const embed = new EmbedBuilder()
        .setColor(parseColor(null))
        .setTitle(`😀 Emojis de ${guild.name} (${emojis.size})`)
        .setDescription(list);
      await interaction.reply({ embeds: [embed] });
    }

    // ── stickers ──
    else if (commandName === "stickers") {
      if (!guild) return interaction.reply({ content: "Serveur uniquement.", ephemeral: true });
      const stickers = guild.stickers.cache;
      if (stickers.size === 0) return interaction.reply({ content: "Ce serveur n'a aucun sticker personnalisé.", ephemeral: true });
      const list = stickers.map((s) => `• **${s.name}**`).join("\n");
      const embed = new EmbedBuilder()
        .setColor(parseColor(null))
        .setTitle(`🖼️ Stickers de ${guild.name} (${stickers.size})`)
        .setDescription(list);
      await interaction.reply({ embeds: [embed] });
    }

    // ── nick (OWNER ONLY) ──
    else if (commandName === "nick") {
      if (!isOwner) return interaction.reply({ content: "Réservé au propriétaire.", ephemeral: true });
      if (!guild) return interaction.reply({ content: "Serveur uniquement.", ephemeral: true });
      const target = interaction.options.getUser("membre", true);
      const pseudo = interaction.options.getString("pseudo") ?? null;
      const guildMember = await guild.members.fetch(target.id).catch(() => null);
      if (!guildMember) return interaction.reply({ content: "Membre introuvable.", ephemeral: true });
      await guildMember.setNickname(pseudo);
      await interaction.reply({ content: pseudo ? `✅ Pseudo de **${target.username}** changé en **${pseudo}**.` : `✅ Pseudo de **${target.username}** réinitialisé.`, ephemeral: true });
    }

    // ── addrole (OWNER ONLY) ──
    else if (commandName === "addrole") {
      if (!isOwner) return interaction.reply({ content: "Réservé au propriétaire.", ephemeral: true });
      if (!guild) return interaction.reply({ content: "Serveur uniquement.", ephemeral: true });
      const target = interaction.options.getUser("membre", true);
      const role = interaction.options.getRole("role", true);
      const guildMember = await guild.members.fetch(target.id).catch(() => null);
      if (!guildMember) return interaction.reply({ content: "Membre introuvable.", ephemeral: true });
      await guildMember.roles.add(role.id);
      await interaction.reply({ content: `✅ Rôle **${role.name}** donné à **${target.username}**.`, ephemeral: true });
    }

    // ── removerole (OWNER ONLY) ──
    else if (commandName === "removerole") {
      if (!isOwner) return interaction.reply({ content: "Réservé au propriétaire.", ephemeral: true });
      if (!guild) return interaction.reply({ content: "Serveur uniquement.", ephemeral: true });
      const target = interaction.options.getUser("membre", true);
      const role = interaction.options.getRole("role", true);
      const guildMember = await guild.members.fetch(target.id).catch(() => null);
      if (!guildMember) return interaction.reply({ content: "Membre introuvable.", ephemeral: true });
      await guildMember.roles.remove(role.id);
      await interaction.reply({ content: `✅ Rôle **${role.name}** retiré de **${target.username}**.`, ephemeral: true });
    }

    // ── dm (OWNER ONLY) ──
    else if (commandName === "dm") {
      if (!isOwner) return interaction.reply({ content: "Réservé au propriétaire.", ephemeral: true });
      const target = interaction.options.getUser("membre", true);
      const message = interaction.options.getString("message", true);
      try {
        await target.send(message);
        await interaction.reply({ content: `✅ DM envoyé à **${target.username}**.`, ephemeral: true });
      } catch {
        await interaction.reply({ content: `❌ Impossible d'envoyer un DM à **${target.username}**. Il a peut-être les DMs fermés.`, ephemeral: true });
      }
    }

    // ── nuke (OWNER ONLY) ──
    else if (commandName === "nuke") {
      if (!isOwner) return interaction.reply({ content: "Réservé au propriétaire.", ephemeral: true });
      if (!guild) return interaction.reply({ content: "Serveur uniquement.", ephemeral: true });
      const targetCh = (interaction.options.getChannel("salon") ?? interaction.channel) as TextChannel;
      await interaction.reply({ content: "💥 Nuking...", ephemeral: true });
      const position = targetCh.position;
      const parent = targetCh.parentId;
      const name = targetCh.name;
      const topic = (targetCh as any).topic ?? null;
      const nsfw = (targetCh as any).nsfw ?? false;
      await targetCh.delete("Nuke par owner");
      const newCh = await guild.channels.create({
        name,
        type: ChannelType.GuildText,
        topic: topic ?? undefined,
        nsfw,
        parent: parent ?? undefined,
        position,
      } as any);
      await (newCh as TextChannel).send("💥 Ce salon a été nuké par l'owner.");
    }

    // ── lockdown (OWNER ONLY) ──
    else if (commandName === "lockdown") {
      if (!isOwner) return interaction.reply({ content: "Réservé au propriétaire.", ephemeral: true });
      if (!guild) return interaction.reply({ content: "Serveur uniquement.", ephemeral: true });
      const actif = interaction.options.getBoolean("actif", true);
      await interaction.deferReply({ ephemeral: true });
      const channels = guild.channels.cache.filter((c) => c.type === ChannelType.GuildText);
      let count = 0;
      for (const [, ch] of channels) {
        try {
          await (ch as TextChannel).permissionOverwrites.edit(guild.roles.everyone, { SendMessages: actif ? false : null });
          count++;
        } catch {}
      }
      await interaction.editReply({ content: actif ? `🔒 Lockdown activé — **${count}** salons verrouillés.` : `🔓 Lockdown levé — **${count}** salons déverrouillés.` });
    }

    // ── massrole (OWNER ONLY) ──
    else if (commandName === "massrole") {
      if (!isOwner) return interaction.reply({ content: "Réservé au propriétaire.", ephemeral: true });
      if (!guild) return interaction.reply({ content: "Serveur uniquement.", ephemeral: true });
      const role = interaction.options.getRole("role", true);
      const donner = interaction.options.getBoolean("donner", true);
      await interaction.deferReply({ ephemeral: true });
      const members = await guild.members.fetch();
      let count = 0;
      for (const [, m] of members) {
        if (m.user.bot) continue;
        try {
          if (donner) await m.roles.add(role.id);
          else await m.roles.remove(role.id);
          count++;
        } catch {}
      }
      await interaction.editReply({ content: `✅ Rôle **${role.name}** ${donner ? "donné à" : "retiré de"} **${count}** membres.` });
    }

    // ── setslowmode (OWNER ONLY) ──
    else if (commandName === "setslowmode") {
      if (!isOwner) return interaction.reply({ content: "Réservé au propriétaire.", ephemeral: true });
      const secondes = interaction.options.getInteger("secondes", true);
      const targetCh = (interaction.options.getChannel("salon") ?? interaction.channel) as TextChannel;
      await (targetCh as any).setRateLimitPerUser(secondes);
      await interaction.reply({ content: secondes === 0 ? `✅ Slowmode désactivé dans <#${targetCh.id}>.` : `✅ Slowmode de **${secondes}s** activé dans <#${targetCh.id}>.`, ephemeral: true });
    }

    // ── ghostping (OWNER ONLY) ──
    else if (commandName === "ghostping") {
      if (!isOwner) return interaction.reply({ content: "Réservé au propriétaire.", ephemeral: true });
      const target = interaction.options.getUser("membre", true);
      const targetCh = (interaction.options.getChannel("salon") ?? interaction.channel) as TextChannel;
      await interaction.deferReply({ ephemeral: true });
      const msg = await targetCh.send(`<@${target.id}>`);
      await msg.delete();
      await interaction.editReply({ content: `👻 Ghost ping envoyé à **${target.username}** dans <#${targetCh.id}>.` });
    }

    // ── status (OWNER ONLY) ──
    else if (commandName === "status") {
      if (!isOwner) return interaction.reply({ content: "Réservé au propriétaire.", ephemeral: true });
      const presence = interaction.options.getString("presence", true) as any;
      const activite = interaction.options.getString("activite");
      client!.user!.setPresence({
        status: presence,
        activities: activite ? [{ name: activite, type: ActivityType.Playing }] : [],
      });
      await interaction.reply({ content: `✅ Statut changé en **${presence}**${activite ? ` avec l'activité **${activite}**` : ""}.`, ephemeral: true });
    }

  } catch (err: any) {
    console.error(`[Discord] Erreur sur /${commandName}:`, err.message);
    try {
      if (interaction.replied || interaction.deferred) {
        await interaction.followUp({ content: "❌ Une erreur est survenue, désolé.", ephemeral: true });
      } else {
        await interaction.reply({ content: "❌ Une erreur est survenue, désolé.", ephemeral: true });
      }
    } catch {}
  }
}

// ── Handle @mention messages ───────────────────────────────────────────────────

async function handleMention(message: any) {
  if (!client?.user) return;
  if (!message.mentions.has(client.user.id)) return;
  if (message.author.bot) return;

  const content = message.content
    .replace(`<@${client.user.id}>`, "")
    .replace(`<@!${client.user.id}>`, "")
    .trim()
    .toLowerCase();

  if (content === "" || content === "help" || content === "aide" || content === "commandes") {
    await message.reply({
      embeds: [
        new EmbedBuilder()
          .setColor(0x5865f2)
          .setTitle("👋 Yo ! C'est moi, GreNouille.exe")
          .setDescription("T'as besoin de moi ? Voilà ce que je sais faire :")
          .addFields(
            { name: "📊 Info", value: "`/ping` `/botinfo` `/serverinfo` `/userinfo` `/avatar` `/membercount`" },
            { name: "🎉 Fun", value: "`/coinflip` `/roll` `/8ball` `/choix` `/hug` `/slap` `/iq`" },
            { name: "📢 Com.", value: "`/embed` `/poll` `/announce`" },
            { name: "🔨 Mod", value: "`/ban` `/kick` `/mute` `/warn` `/clear` `/lock`" }
          )
          .setFooter({ text: "Tape /help pour la liste complète !" }),
      ],
    });
  } else if (content === "ping") {
    await message.reply(`🏓 Pong ! ${client.ws.ping}ms — je suis là !`);
  } else if (["bonjour", "salut", "hello", "coucou", "yo", "wesh", "cc"].includes(content)) {
    const greetings = [
      `Yo **${message.author.username}** ! 🐸`,
      `Salut **${message.author.username}** ! Quoi de neuf ?`,
      `Coucou **${message.author.username}** ! 👋`,
      `Hey **${message.author.username}** ! Content de te voir.`,
    ];
    await message.reply(greetings[Math.floor(Math.random() * greetings.length)]);
  } else if (content.includes("merci") || content.includes("thanks") || content.includes("thx")) {
    await message.reply(`De rien **${message.author.username}** ! C'est mon taff 😄`);
  } else {
    await message.reply(`Hey **${message.author.username}** ! Tape \`/help\` pour voir ce que je sais faire. Je suis là si t'as besoin 🐸`);
  }
}

// ── Gateway init ───────────────────────────────────────────────────────────────

let reconnectAttempts = 0;
const MAX_RECONNECT_DELAY = 60_000;

async function scheduleReconnect(botToken: string) {
  if (reconnectAttempts >= 25) {
    console.error("[Discord] Trop de tentatives de reconnexion, abandon définitif.");
    return;
  }
  reconnectAttempts++;
  const delay = Math.min(5_000 * Math.pow(1.5, reconnectAttempts - 1), MAX_RECONNECT_DELAY);
  console.log(`[Discord] Reconnexion dans ${Math.round(delay / 1000)}s (tentative ${reconnectAttempts})...`);
  setTimeout(() => connectGateway(botToken), delay);
}

async function connectGateway(botToken: string) {
  try {
    if (client) {
      client.removeAllListeners();
      try { client.destroy(); } catch {}
      client = null;
      gatewayReady = false;
    }

    client = new Client({
      intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.GuildMembers,
        GatewayIntentBits.GuildModeration,
        GatewayIntentBits.MessageContent,
      ],
    });

    client.once("ready", async () => {
      gatewayReady = true;
      reconnectAttempts = 0;
      console.log(`[Discord] Gateway prêt — connecté en tant que ${client!.user!.tag}`);
      await registerSlashCommands(botToken, client!.user!.id);
    });

    client.on("interactionCreate", handleInteraction);
    client.on("messageCreate", handleMention);

    client.on("error", (err) => {
      console.error("[Discord] Erreur gateway:", err.message);
    });

    client.on("shardDisconnect" as any, (_event: any, shardId: number) => {
      console.warn(`[Discord] Shard ${shardId} déconnecté.`);
      gatewayReady = false;
      scheduleReconnect(botToken);
    });

    client.on("shardReconnecting" as any, (shardId: number) => {
      console.log(`[Discord] Shard ${shardId} en cours de reconnexion...`);
    });

    client.on("shardResume" as any, (shardId: number) => {
      gatewayReady = true;
      reconnectAttempts = 0;
      console.log(`[Discord] Shard ${shardId} repris.`);
    });

    await client.login(botToken);
  } catch (err: any) {
    console.error("[Discord] Impossible de se connecter:", err.message);
    client = null;
    gatewayReady = false;
    scheduleReconnect(botToken);
  }
}

export function initDiscordGateway(): Promise<void> {
  const botToken = process.env.DISCORD_BOT_TOKEN;
  if (!botToken) {
    console.log("[Discord] Bot token not configured, skipping gateway init.");
    return Promise.resolve();
  }
  reconnectAttempts = 0;
  connectGateway(botToken).catch((err) =>
    console.error("[Discord] Gateway init failed:", err?.message ?? err)
  );
  return Promise.resolve();
}

export function getDiscordClient(): Client | null {
  return client;
}

export function isGatewayReady(): boolean {
  return gatewayReady && client !== null;
}

export async function setBotStatus(status: PresenceStatusData, activityName?: string, activityType?: number) {
  if (!client?.user) throw new Error("Discord client pas connecté");
  client.user.setPresence({
    status,
    activities: activityName
      ? [{ name: activityName, type: (activityType ?? ActivityType.Playing) as any }]
      : [],
  });
}

export function getBotInfo() {
  if (!client?.user) return null;
  return {
    username: client.user.username,
    discriminator: client.user.discriminator,
    id: client.user.id,
    avatarUrl: client.user.displayAvatarURL({ size: 256 }),
    ping: client.ws.ping,
    guildCount: client.guilds.cache.size,
    status: client.user.presence?.status ?? "online",
    uptime: client.uptime ? Math.floor(client.uptime / 1000) : 0,
    tag: client.user.tag,
  };
}

export function getBotGuilds() {
  if (!client) return [];
  return client.guilds.cache.map((g) => ({
    id: g.id,
    name: g.name,
    memberCount: g.memberCount,
    iconUrl: g.iconURL({ size: 64 }) ?? null,
  }));
}
